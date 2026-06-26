import { getRedis, awardEntries, loadUser } from '../../_lib/store';

// ═══════════════════════════════════════════════════════════════
// SHOPPROPS GIVEAWAY — admin endpoint
// ───────────────────────────────────────────────────────────────
// Protected by the GIVEAWAY_ADMIN_SECRET env var. Pass it as either
// the `x-admin-secret` header or a `secret` field in the JSON body.
//
// Actions (POST { action, ... }):
//   start        { endDate }        -> open entries, set countdown target
//   stop                            -> close entries
//   stats                           -> totals + top entrants by entries
//   proofs       { status? }        -> list proof submissions (default pending)
//   approveProof { id, bonus? }     -> approve, grant bonus entries
//   rejectProof  { id, reason? }    -> reject a submission
//   draw         { count?, excludePastWinners? } -> pick + log winner(s)
//   winners                         -> winner history
//   newRound                        -> bump the weekly round counter
//   reset        { confirm }        -> wipe ALL giveaway data (confirm:"RESET")
// ═══════════════════════════════════════════════════════════════

const PROOF_BONUS = 25; // entries granted when a proof is approved

function authorized(request, body) {
  const secret = process.env.GIVEAWAY_ADMIN_SECRET;
  if (!secret) return false;
  const provided = request.headers.get('x-admin-secret') || body?.secret || '';
  return provided === secret;
}

async function getProof(r, id) {
  const p = await r.hgetall(`proof:${id}`);
  if (!p || !p.id) return null;
  p.entriesAwarded = Number(p.entriesAwarded || 0);
  p.createdAt = Number(p.createdAt || 0);
  p.round = Number(p.round || 1);
  return p;
}

export async function POST(request) {
  const r = getRedis();
  if (!r) return Response.json({ error: 'Storage not configured.' }, { status: 503 });

  let body;
  try { body = await request.json(); } catch { body = {}; }
  if (!authorized(request, body)) return Response.json({ error: 'Unauthorized.' }, { status: 401 });

  const action = body.action;

  try {
    if (action === 'start') {
      const endDate = body.endDate || new Date(Date.now() + 7 * 864e5).toISOString();
      await r.set('giveaway:active', '1');
      await r.set('giveaway:endDate', endDate);
      if (!(await r.get('giveaway:round'))) await r.set('giveaway:round', 1);
      return Response.json({ success: true, active: true, endDate });
    }

    if (action === 'stop') {
      await r.set('giveaway:active', '');
      return Response.json({ success: true, active: false });
    }

    if (action === 'stats') {
      const [active, endDate, round, totalEntries, totalEntrants, pending, top] = await Promise.all([
        r.get('giveaway:active'), r.get('giveaway:endDate'), r.get('giveaway:round'),
        r.get('giveaway:totalEntries'), r.zcard('giveaway:entrants'),
        r.zcard('proof:pending'),
        r.zrange('giveaway:board', 0, 19, { rev: true, withScores: true }),
      ]);
      const leaderboard = [];
      for (let i = 0; i < (top || []).length; i += 2) leaderboard.push({ email: top[i], entries: Number(top[i + 1]) });
      return Response.json({
        success: true, active: !!active, endDate: endDate || null, round: Number(round || 1),
        totalEntries: Number(totalEntries || 0), totalEntrants: Number(totalEntrants || 0),
        pendingProofs: Number(pending || 0), leaderboard,
      });
    }

    // ── proof review ──
    if (action === 'proofs') {
      const status = body.status || 'pending';
      const key = status === 'pending' ? 'proof:pending' : 'proof:all';
      const ids = await r.zrange(key, 0, 49, { rev: true });
      const proofs = [];
      for (const id of ids || []) {
        const p = await getProof(r, id);
        if (p && (status === 'all' || status === 'pending' || p.status === status)) proofs.push(p);
      }
      return Response.json({ success: true, proofs });
    }

    if (action === 'approveProof') {
      const p = await getProof(r, body.id);
      if (!p) return Response.json({ error: 'Proof not found.' }, { status: 404 });
      if (p.status === 'approved') return Response.json({ success: true, alreadyApproved: true });
      const bonus = Math.max(1, Math.min(500, Number(body.bonus || PROOF_BONUS)));
      const newEntries = await awardEntries(r, p.email, p.name, p.amount, 'proof');
      await r.hset(`proof:${p.id}`, { status: 'approved', entriesAwarded: bonus, reviewedAt: Date.now() });
      await r.zrem('proof:pending', p.id);
      return Response.json({ success: true, awarded: bonus, email: p.email, entries: newEntries });
    }

    if (action === 'rejectProof') {
      const p = await getProof(r, body.id);
      if (!p) return Response.json({ error: 'Proof not found.' }, { status: 404 });
      await r.hset(`proof:${p.id}`, { status: 'rejected', rejectReason: String(body.reason || '').slice(0, 200), reviewedAt: Date.now() });
      await r.zrem('proof:pending', p.id);
      return Response.json({ success: true, rejected: p.id });
    }

    // ── winner draw (weighted by entries) ──
    if (action === 'draw') {
      const count = Math.max(1, Math.min(10, Number(body.count || 1)));
      const board = await r.zrange('giveaway:board', 0, -1, { withScores: true });
      let pool = [];
      for (let i = 0; i < (board || []).length; i += 2) pool.push({ email: board[i], entries: Number(board[i + 1]) });

      if (body.excludePastWinners) {
        const past = await r.lrange('giveaway:winners', 0, -1);
        const pastEmails = new Set((past || []).map(w => { try { return JSON.parse(w).email; } catch { return null; } }));
        pool = pool.filter(p => !pastEmails.has(p.email));
      }
      if (!pool.length) return Response.json({ error: 'No eligible entrants.' }, { status: 400 });

      const round = Number(await r.get('giveaway:round') || 1);
      const winners = [];
      const remaining = [...pool];
      for (let n = 0; n < count && remaining.length; n++) {
        const total = remaining.reduce((s, p) => s + p.entries, 0);
        let roll = Math.random() * total, idx = 0;
        for (let i = 0; i < remaining.length; i++) { roll -= remaining[i].entries; if (roll <= 0) { idx = i; break; } }
        const picked = remaining.splice(idx, 1)[0];
        const u = await loadUser(r, picked.email);
        const w = { email: picked.email, name: u?.name || '', entries: picked.entries, round, ts: Date.now() };
        winners.push(w);
        await r.lpush('giveaway:winners', JSON.stringify(w));
      }
      return Response.json({ success: true, round, winners });
    }

    if (action === 'winners') {
      const raw = await r.lrange('giveaway:winners', 0, 49);
      const winners = (raw || []).map(w => { try { return JSON.parse(w); } catch { return null; } }).filter(Boolean);
      return Response.json({ success: true, winners });
    }

    if (action === 'newRound') {
      const round = Number(await r.get('giveaway:round') || 1) + 1;
      await r.set('giveaway:round', round);
      return Response.json({ success: true, round });
    }

    if (action === 'reset') {
      if (body.confirm !== 'RESET') return Response.json({ error: 'Pass confirm:"RESET" to wipe all data.' }, { status: 400 });
      const entrants = await r.zrange('giveaway:entrants', 0, -1);
      for (const email of entrants || []) {
        const u = await r.hgetall(`giveaway:user:${email}`);
        if (u?.code) await r.del(`giveaway:code:${u.code}`);
        await r.del(`giveaway:user:${email}`);
        await r.del(`proof:byEmail:${email}`);
      }
      const proofIds = await r.zrange('proof:all', 0, -1);
      for (const id of proofIds || []) await r.del(`proof:${id}`);
      await r.del('giveaway:board', 'giveaway:entrants', 'giveaway:feed', 'giveaway:totalEntries', 'proof:pending', 'proof:all', 'giveaway:winners');
      await r.set('giveaway:active', '');
      await r.set('giveaway:round', 1);
      return Response.json({ success: true, wipedEntrants: (entrants || []).length, wipedProofs: (proofIds || []).length });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: 'Admin action failed.' }, { status: 500 });
  }
}
