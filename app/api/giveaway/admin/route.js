import { Redis } from '@upstash/redis';

// ═══════════════════════════════════════════════════════════════
// SHOPPROPS GIVEAWAY — admin endpoint
// ───────────────────────────────────────────────────────────────
// Protected by the GIVEAWAY_ADMIN_SECRET env var. Pass it as either
// the `x-admin-secret` header or a `secret` field in the JSON body.
//
// Actions (POST { action, ... }):
//   start     { endDate }   -> open entries, set countdown target
//   stop                    -> close entries
//   stats                   -> totals + top entrants by entries
//   draw      { count? }     -> pick winner(s), weighted by entries
//   reset     { confirm }    -> wipe ALL giveaway data (confirm: "RESET")
// ═══════════════════════════════════════════════════════════════

let redis = null;
function getRedis() {
  if (redis) return redis;
  try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      redis = Redis.fromEnv();
    }
  } catch { redis = null; }
  return redis;
}

function authorized(request, body) {
  const secret = process.env.GIVEAWAY_ADMIN_SECRET;
  if (!secret) return false; // must be explicitly configured
  const provided = request.headers.get('x-admin-secret') || body?.secret || '';
  return provided === secret;
}

async function loadUser(r, email) {
  const u = await r.hgetall(`giveaway:user:${email}`);
  if (!u || !u.email) return null;
  u.entries = Number(u.entries || 0);
  u.referrals = Number(u.referrals || 0);
  return u;
}

export async function POST(request) {
  const r = getRedis();
  if (!r) return Response.json({ error: 'Storage not configured.' }, { status: 503 });

  let body;
  try { body = await request.json(); } catch { body = {}; }

  if (!authorized(request, body)) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const action = body.action;

  try {
    if (action === 'start') {
      const endDate = body.endDate || new Date(Date.now() + 14 * 864e5).toISOString();
      await r.set('giveaway:active', '1');
      await r.set('giveaway:endDate', endDate);
      return Response.json({ success: true, active: true, endDate });
    }

    if (action === 'stop') {
      await r.set('giveaway:active', '');
      return Response.json({ success: true, active: false });
    }

    if (action === 'stats') {
      const [active, endDate, totalEntries, totalEntrants, top] = await Promise.all([
        r.get('giveaway:active'),
        r.get('giveaway:endDate'),
        r.get('giveaway:totalEntries'),
        r.zcard('giveaway:entrants'),
        r.zrange('giveaway:board', 0, 19, { rev: true, withScores: true }),
      ]);
      // zrange withScores returns [member, score, member, score, ...]
      const leaderboard = [];
      for (let i = 0; i < (top || []).length; i += 2) {
        leaderboard.push({ email: top[i], entries: Number(top[i + 1]) });
      }
      return Response.json({
        success: true,
        active: !!active,
        endDate: endDate || null,
        totalEntries: Number(totalEntries || 0),
        totalEntrants: Number(totalEntrants || 0),
        leaderboard,
      });
    }

    if (action === 'draw') {
      const count = Math.max(1, Math.min(10, Number(body.count || 1)));
      // Pull every entrant + entry weight, build a weighted pool, draw N unique.
      const board = await r.zrange('giveaway:board', 0, -1, { withScores: true });
      const pool = [];
      for (let i = 0; i < (board || []).length; i += 2) {
        pool.push({ email: board[i], entries: Number(board[i + 1]) });
      }
      if (!pool.length) return Response.json({ error: 'No entrants yet.' }, { status: 400 });

      const winners = [];
      const remaining = [...pool];
      for (let n = 0; n < count && remaining.length; n++) {
        const total = remaining.reduce((s, p) => s + p.entries, 0);
        let roll = Math.random() * total;
        let idx = 0;
        for (let i = 0; i < remaining.length; i++) {
          roll -= remaining[i].entries;
          if (roll <= 0) { idx = i; break; }
        }
        const picked = remaining.splice(idx, 1)[0];
        const u = await loadUser(r, picked.email);
        winners.push({ email: picked.email, name: u?.name || '', entries: picked.entries });
      }
      return Response.json({ success: true, winners });
    }

    if (action === 'reset') {
      if (body.confirm !== 'RESET') {
        return Response.json({ error: 'Pass confirm:"RESET" to wipe all data.' }, { status: 400 });
      }
      // Delete per-user + code keys, then the index keys.
      const entrants = await r.zrange('giveaway:entrants', 0, -1);
      for (const email of entrants || []) {
        const u = await r.hgetall(`giveaway:user:${email}`);
        if (u?.code) await r.del(`giveaway:code:${u.code}`);
        await r.del(`giveaway:user:${email}`);
      }
      await r.del('giveaway:board', 'giveaway:entrants', 'giveaway:feed', 'giveaway:totalEntries');
      await r.set('giveaway:active', '');
      return Response.json({ success: true, wiped: (entrants || []).length });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: 'Admin action failed.' }, { status: 500 });
  }
}
