'use client';
import { useState, useEffect, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════
// SHOPPROPS GIVEAWAY — admin dashboard
// Client-only console for /api/giveaway/admin. The secret is held in
// memory + localStorage and sent as the x-admin-secret header.
// Not indexed (see robots.js + the noindex meta in app/admin/layout.js).
// ═══════════════════════════════════════════════════════════════

const CYAN = '#00e5ff';
const GREEN = '#22c55e';
const RED = '#f87171';
const AMBER = '#f59e0b';
const DARK = '#070b11';
const CARD = '#0c1119';
const BORDER = '#151d2b';
const MUTED = '#64748b';
const TEXT = '#cbd5e1';
const KEY = 'shopprops_admin_secret';

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [proofs, setProofs] = useState([]);
  const [proofFilter, setProofFilter] = useState('pending');
  const [winners, setWinners] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [endDate, setEndDate] = useState('');
  const [drawCount, setDrawCount] = useState(1);
  const [excludePast, setExcludePast] = useState(true);

  // ── API helper ──
  const call = useCallback(async (action, extra = {}, sec) => {
    const s = sec ?? secret;
    const res = await fetch('/api/giveaway/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': s },
      body: JSON.stringify({ action, ...extra }),
    });
    return res.json();
  }, [secret]);

  const flash = (m, isErr) => { (isErr ? setErr : setMsg)(m); setTimeout(() => { setErr(''); setMsg(''); }, 4000); };

  const loadStats = useCallback(async (sec) => {
    const d = await call('stats', {}, sec);
    if (d.error) { flash(d.error, true); return false; }
    setStats(d);
    return true;
  }, [call]);

  const loadProofs = useCallback(async (status = proofFilter) => {
    const d = await call('proofs', { status });
    if (!d.error) setProofs(d.proofs || []);
  }, [call, proofFilter]);

  const loadWinners = useCallback(async () => {
    const d = await call('winners');
    if (!d.error) setWinners(d.winners || []);
  }, [call]);

  // restore session
  useEffect(() => {
    let s = '';
    try { s = localStorage.getItem(KEY) || ''; } catch {}
    if (s) { setSecret(s); loadStats(s).then(ok => { if (ok) setAuthed(true); }); }
  }, [loadStats]);

  const login = async () => {
    setErr('');
    if (!secret) return;
    setBusy(true);
    const ok = await loadStats(secret);
    setBusy(false);
    if (ok) {
      setAuthed(true);
      try { localStorage.setItem(KEY, secret); } catch {}
    } else {
      flash('Invalid secret or storage not configured.', true);
    }
  };

  const logout = () => { setAuthed(false); setSecret(''); try { localStorage.removeItem(KEY); } catch {} };

  useEffect(() => {
    if (!authed) return;
    if (tab === 'overview') loadStats();
    if (tab === 'proofs') loadProofs();
    if (tab === 'winners') { loadStats(); loadWinners(); }
  }, [authed, tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (action, extra, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusy(true);
    const d = await call(action, extra);
    setBusy(false);
    if (d.error) { flash(d.error, true); return d; }
    return d;
  };

  // ── styles ──
  const S = {
    btn: { padding: '10px 18px', background: CYAN, color: DARK, fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 12, letterSpacing: 1, border: 'none', cursor: 'pointer', borderRadius: 6 },
    ghost: { padding: '8px 14px', background: 'transparent', color: MUTED, border: `1px solid ${BORDER}`, borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: "'Space Mono',monospace" },
    input: { padding: '12px 14px', background: '#0a0f17', border: `1px solid ${BORDER}`, borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none', fontFamily: "'Outfit',sans-serif" },
    card: { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20 },
    label: { fontFamily: "'Space Mono',monospace", fontSize: 10, color: MUTED, letterSpacing: 1.5, textTransform: 'uppercase' },
  };

  const wrap = { minHeight: '100vh', background: DARK, color: TEXT, fontFamily: "'Outfit',sans-serif", padding: 24 };
  const fonts = (
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');
      *{margin:0;padding:0;box-sizing:border-box} input,select{outline:none}
      .ahov:hover{border-color:${CYAN}!important;color:${CYAN}!important}`}</style>
  );

  // ── login gate ──
  if (!authed) {
    return (
      <div style={{ ...wrap, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {fonts}
        <div style={{ ...S.card, width: '100%', maxWidth: 380, padding: 32 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: '#fff', letterSpacing: 1, marginBottom: 4 }}>
            <span style={{ color: CYAN }}>SHOP</span>PROPS ADMIN
          </div>
          <p style={{ color: MUTED, fontSize: 13, marginBottom: 20 }}>Enter your giveaway admin secret.</p>
          <input style={{ ...S.input, width: '100%', marginBottom: 12 }} type="password" placeholder="Admin secret"
            value={secret} onChange={e => setSecret(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
          {err && <p style={{ color: RED, fontSize: 12, marginBottom: 12 }}>{err}</p>}
          <button style={{ ...S.btn, width: '100%' }} onClick={login} disabled={busy}>{busy ? 'Checking…' : 'Sign in'}</button>
          <p style={{ ...S.label, marginTop: 16, lineHeight: 1.6 }}>Set <code style={{ color: TEXT }}>GIVEAWAY_ADMIN_SECRET</code> in Vercel env to enable.</p>
        </div>
      </div>
    );
  }

  const Stat = ({ label, value, color }) => (
    <div style={S.card}>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 28, fontWeight: 700, color: color || '#fff' }}>{value}</div>
      <div style={{ ...S.label, marginTop: 6 }}>{label}</div>
    </div>
  );

  return (
    <div style={wrap}>
      {fonts}
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: '#fff', letterSpacing: 1 }}>
            <span style={{ color: CYAN }}>SHOP</span>PROPS ADMIN
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {stats && <span style={{ ...S.label, color: stats.active ? GREEN : AMBER }}>● {stats.active ? 'LIVE' : 'PAUSED'} · Round {stats.round}</span>}
            <a href="/giveaway" target="_blank" rel="noreferrer" style={{ ...S.ghost, textDecoration: 'none' }} className="ahov">View page ↗</a>
            <button style={S.ghost} className="ahov" onClick={logout}>Sign out</button>
          </div>
        </div>

        {/* tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[['overview', 'Overview'], ['proofs', `Proofs${stats?.pendingProofs ? ` (${stats.pendingProofs})` : ''}`], ['winners', 'Winners'], ['controls', 'Controls']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ ...S.ghost, ...(tab === k ? { color: CYAN, borderColor: CYAN } : {}) }}>{l}</button>
          ))}
        </div>

        {msg && <div style={{ ...S.card, borderColor: GREEN + '50', color: GREEN, marginBottom: 16, padding: 12 }}>{msg}</div>}
        {err && <div style={{ ...S.card, borderColor: RED + '50', color: RED, marginBottom: 16, padding: 12 }}>{err}</div>}

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && stats && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 20 }}>
              <Stat label="Entrants" value={stats.totalEntrants?.toLocaleString()} />
              <Stat label="Total Entries" value={stats.totalEntries?.toLocaleString()} color={CYAN} />
              <Stat label="Pending Proofs" value={stats.pendingProofs} color={stats.pendingProofs ? AMBER : '#fff'} />
              <Stat label="Round" value={stats.round} />
            </div>
            <div style={S.card}>
              <div style={{ ...S.label, marginBottom: 12 }}>Leaderboard — top entrants</div>
              {(stats.leaderboard || []).length === 0 ? <p style={{ color: MUTED, fontSize: 14 }}>No entries yet.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {stats.leaderboard.map((e, i) => (
                    <div key={e.email} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: i < stats.leaderboard.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                      <span style={{ color: TEXT }}><span style={{ color: MUTED }}>#{i + 1}</span> {e.email}</span>
                      <span style={{ color: CYAN, fontFamily: "'Space Mono',monospace" }}>{e.entries}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PROOFS ── */}
        {tab === 'proofs' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {['pending', 'approved', 'rejected', 'all'].map(f => (
                <button key={f} onClick={() => { setProofFilter(f); loadProofs(f); }} style={{ ...S.ghost, textTransform: 'capitalize', ...(proofFilter === f ? { color: CYAN, borderColor: CYAN } : {}) }}>{f}</button>
              ))}
              <button onClick={() => loadProofs()} style={{ ...S.ghost, marginLeft: 'auto' }}>↻ Refresh</button>
            </div>
            {proofs.length === 0 ? <div style={{ ...S.card, color: MUTED }}>No {proofFilter} submissions.</div> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
                {proofs.map(p => (
                  <div key={p.id} style={S.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, color: '#fff' }}>{p.name}</span>
                      <span style={{ ...S.label, color: p.status === 'approved' ? GREEN : p.status === 'rejected' ? RED : AMBER }}>{p.status}</span>
                    </div>
                    <div style={{ fontSize: 13, color: MUTED, marginBottom: 4 }}>{p.email}</div>
                    <div style={{ fontSize: 13, color: TEXT }}>{p.firm} · code <strong style={{ color: CYAN }}>{p.code}</strong>{p.amount ? ` · ${p.amount}` : ''}</div>
                    {p.imageUrl ? (
                      <a href={p.imageUrl} target="_blank" rel="noreferrer">
                        <img src={p.imageUrl} alt="receipt" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, margin: '10px 0', border: `1px solid ${BORDER}` }} />
                      </a>
                    ) : (
                      <div style={{ ...S.label, color: AMBER, margin: '10px 0' }}>⚠ {p.imageNote === 'no_image_attached' ? 'No image attached' : 'Image not stored (Blob off)'}</div>
                    )}
                    {p.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button style={{ ...S.btn, flex: 1, background: GREEN, color: '#04210f' }} disabled={busy}
                          onClick={async () => { const d = await act('approveProof', { id: p.id }); if (d?.success) { flash(`Approved +${d.awarded} for ${d.email}`); loadProofs(); loadStats(); } }}>
                          Approve +25
                        </button>
                        <button style={{ ...S.btn, background: 'transparent', color: RED, border: `1px solid ${RED}40` }} disabled={busy}
                          onClick={async () => { const d = await act('rejectProof', { id: p.id, reason: 'rejected by admin' }); if (d?.success) { flash('Rejected'); loadProofs(); loadStats(); } }}>
                          Reject
                        </button>
                      </div>
                    )}
                    {p.status === 'approved' && <div style={{ ...S.label, color: GREEN, marginTop: 8 }}>✓ Granted {p.entriesAwarded} entries</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── WINNERS ── */}
        {tab === 'winners' && (
          <div>
            <div style={{ ...S.card, marginBottom: 16 }}>
              <div style={{ ...S.label, marginBottom: 12 }}>Draw a winner (weighted by entries)</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <label style={{ fontSize: 13, color: MUTED }}>Count <input type="number" min={1} max={10} value={drawCount} onChange={e => setDrawCount(e.target.value)} style={{ ...S.input, width: 70, marginLeft: 6 }} /></label>
                <label style={{ fontSize: 13, color: MUTED, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="checkbox" checked={excludePast} onChange={e => setExcludePast(e.target.checked)} style={{ accentColor: CYAN }} /> Exclude past winners
                </label>
                <button style={S.btn} disabled={busy}
                  onClick={async () => { const d = await act('draw', { count: Number(drawCount), excludePastWinners: excludePast }); if (d?.success) { flash(`Drew ${d.winners.length} winner(s)`); loadWinners(); } }}>
                  🎲 Draw
                </button>
              </div>
            </div>
            <div style={S.card}>
              <div style={{ ...S.label, marginBottom: 12 }}>Winner history</div>
              {winners.length === 0 ? <p style={{ color: MUTED, fontSize: 14 }}>No winners drawn yet.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {winners.map((w, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: i < winners.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                      <span><span style={{ ...S.label, color: AMBER }}>R{w.round}</span> <strong style={{ color: '#fff' }}>{w.name || '—'}</strong> <span style={{ color: MUTED }}>{w.email}</span></span>
                      <span style={{ color: CYAN, fontFamily: "'Space Mono',monospace" }}>{w.entries} entries</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CONTROLS ── */}
        {tab === 'controls' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={S.card}>
              <div style={{ ...S.label, marginBottom: 12 }}>Giveaway status</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} style={S.input} />
                <button style={{ ...S.btn, background: GREEN, color: '#04210f' }} disabled={busy}
                  onClick={async () => { const iso = endDate ? new Date(endDate).toISOString() : undefined; const d = await act('start', { endDate: iso }); if (d?.success) { flash('Giveaway started'); loadStats(); } }}>
                  ▶ Start / set end date
                </button>
                <button style={{ ...S.ghost, color: AMBER, borderColor: AMBER + '50' }} disabled={busy}
                  onClick={async () => { const d = await act('stop'); if (d?.success) { flash('Entries paused'); loadStats(); } }}>
                  ⏸ Stop entries
                </button>
              </div>
              <p style={{ ...S.label, marginTop: 10 }}>Current end: {stats?.endDate ? new Date(stats.endDate).toLocaleString() : '—'}</p>
            </div>
            <div style={S.card}>
              <div style={{ ...S.label, marginBottom: 12 }}>Weekly round</div>
              <button style={S.ghost} className="ahov" disabled={busy}
                onClick={async () => { const d = await act('newRound', {}, 'Advance to the next weekly round?'); if (d?.success) { flash(`Now on round ${d.round}`); loadStats(); } }}>
                → Advance to next round
              </button>
            </div>
            <div style={{ ...S.card, borderColor: RED + '40' }}>
              <div style={{ ...S.label, marginBottom: 8, color: RED }}>Danger zone</div>
              <p style={{ color: MUTED, fontSize: 13, marginBottom: 12 }}>Wipes ALL entrants, proofs, winners, and totals. Cannot be undone.</p>
              <button style={{ ...S.ghost, color: RED, borderColor: RED + '50' }} disabled={busy}
                onClick={async () => { const d = await act('reset', { confirm: 'RESET' }, 'Type-confirm: wipe EVERYTHING? This cannot be undone.'); if (d?.success) { flash(`Wiped ${d.wipedEntrants} entrants, ${d.wipedProofs} proofs`); loadStats(); } }}>
                Reset all giveaway data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
