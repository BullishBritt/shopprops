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
const WHEEL_COLORS = ['#00e5ff', '#22c55e', '#0ea5e9', '#14b8a6', '#38bdf8', '#4ade80'];

// ── Spin-the-wheel ──────────────────────────────────────────────
// Slices can be weighted: pass entrants with a `weight` (e.g. entry
// count) and bigger weights get bigger slices. No weight = equal slices.
function wheelWeights(list) {
  return list.map(e => Math.max(1, Number(e.weight) || 1));
}

// Mid-angle (degrees from top, clockwise) of slice `idx` — used to land
// the winner's slice under the pointer.
function midAngleOf(list, idx) {
  const ws = wheelWeights(list);
  const total = ws.reduce((s, w) => s + w, 0) || 1;
  let acc = 0;
  for (let i = 0; i < idx; i++) acc += ws[i];
  return ((acc + ws[idx] / 2) / total) * 360;
}

function Wheel({ entrants, rotation, spinning }) {
  const R = 190, cx = 200, cy = 200;
  const n = entrants.length;
  const ws = wheelWeights(entrants);
  const total = ws.reduce((s, w) => s + w, 0) || 1;
  let acc = 0;
  const segs = entrants.map((e, i) => {
    const start = (acc / total) * 360;
    acc += ws[i];
    return { start, end: (acc / total) * 360 };
  });
  const toXY = (deg, rad) => {
    const a = ((-90 + deg) * Math.PI) / 180; // 0° at top, clockwise
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  };
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 400, margin: '0 auto' }}>
      {/* pointer */}
      <div style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)', zIndex: 3, width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: '24px solid #fff', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.5))' }} />
      <svg viewBox="0 0 400 400" style={{ width: '100%', transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 5.5s cubic-bezier(.17,.67,.16,1)' : 'none' }}>
        {entrants.length === 0 ? (
          <circle cx={cx} cy={cy} r={R} fill="#0c1119" stroke="#151d2b" strokeWidth="2" />
        ) : entrants.length === 1 ? (
          <g>
            <circle cx={cx} cy={cy} r={R} fill={WHEEL_COLORS[0]} stroke="#070b11" strokeWidth="1.5" />
            <text x={cx} y={cy - R * 0.55} fill="#04210f" fontSize="16" fontWeight="700" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: "'Outfit',sans-serif" }}>
              {(entrants[0].name || '').slice(0, 14)}
            </text>
          </g>
        ) : entrants.map((e, i) => {
          const { start, end } = segs[i];
          const sweep = end - start;
          const [x1, y1] = toXY(start, R);
          const [x2, y2] = toXY(end, R);
          const large = sweep > 180 ? 1 : 0;
          const mid = (start + end) / 2;
          const [lx, ly] = toXY(mid, R * 0.62);
          const label = (e.name || '').slice(0, 14);
          return (
            <g key={i}>
              <path d={`M${cx},${cy} L${x1},${y1} A${R},${R} 0 ${large} 1 ${x2},${y2} Z`} fill={WHEEL_COLORS[i % WHEEL_COLORS.length]} stroke="#070b11" strokeWidth="1.5" />
              {n <= 40 && sweep >= 7 && (
                <text x={lx} y={ly} fill="#04210f" fontSize={n > 24 ? 9 : 12} fontWeight="700" textAnchor="middle" dominantBaseline="middle"
                  transform={`rotate(${mid}, ${lx}, ${ly})`} style={{ fontFamily: "'Outfit',sans-serif" }}>{label}</text>
              )}
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#1e293b" strokeWidth="3" />
        <circle cx={cx} cy={cy} r={26} fill="#070b11" stroke="#00e5ff" strokeWidth="2" />
      </svg>
    </div>
  );
}

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
  // live "spin the wheel" round
  const [liveMinutes, setLiveMinutes] = useState(5);
  const [liveInfo, setLiveInfo] = useState(null);
  const [liveCountdown, setLiveCountdown] = useState(null);
  const [wheelEntrants, setWheelEntrants] = useState([]);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [liveWinner, setLiveWinner] = useState(null);
  const [liveName, setLiveName] = useState('');

  // ── API helper ──
  const call = useCallback(async (action, extra = {}, sec) => {
    const s = sec ?? secret;
    try {
      const res = await fetch('/api/giveaway/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': s },
        body: JSON.stringify({ action, ...extra }),
      });
      return await res.json();
    } catch {
      return { error: 'Network problem — check your connection and try again.' };
    }
  }, [secret]);

  const flash = (m, isErr) => { (isErr ? setErr : setMsg)(m); setTimeout(() => { setErr(''); setMsg(''); }, 4000); };

  // Returns true on success, or the server's error message string on failure.
  const loadStats = useCallback(async (sec) => {
    const d = await call('stats', {}, sec);
    if (d.error) return d.error;
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

  const loadLive = useCallback(async () => {
    const d = await call('liveEntrants');
    if (!d.error) setLiveInfo(d);
  }, [call]);

  const startLive = async () => {
    setLiveWinner(null); setWheelEntrants([]); setRotation(0);
    const d = await act('startLive', { minutes: Number(liveMinutes) });
    if (d?.success) { flash(`Live round open for ${d.minutes} min!`); loadLive(); }
  };

  const loadBuyers = async () => {
    setLiveWinner(null); setWheelEntrants([]); setRotation(0);
    const d = await act('loadBuyers');
    if (d?.success) { flash(`🧾 ${d.count} verified code-user${d.count > 1 ? 's' : ''} loaded onto the wheel`); loadLive(); }
  };

  const addName = async () => {
    if (!liveName.trim()) return;
    const d = await act('addLiveName', { name: liveName.trim() });
    if (d?.success) { setLiveName(''); loadLive(); }
  };

  const clearPool = async () => {
    if (!window.confirm('Clear everyone off the wheel?')) return;
    const d = await act('clearLive');
    if (d?.success) { setWheelEntrants([]); setLiveWinner(null); setRotation(0); loadLive(); }
  };

  const spin = async () => {
    if (spinning) return;
    const d = await act('drawLive');
    if (!d?.success) return;
    const list = d.entrants || [];
    setWheelEntrants(list);
    setLiveWinner(null);
    // land the winner's slice under the top pointer, after several full spins
    const target = 360 * 8 - midAngleOf(list, d.winnerIndex);
    setSpinning(true);
    setRotation(prev => prev - (prev % 360) + target); // normalize then add
    setTimeout(() => { setSpinning(false); setLiveWinner(d.winner); flash(`🎉 Winner: ${d.winner.name}`); loadStats(); loadWinners(); }, 5600);
  };

  // Weekly Friday wheel: everyone in the giveaway, slice size = entries.
  const spinWeekly = async () => {
    if (spinning) return;
    const d = await act('drawWeekly', { excludePastWinners: excludePast });
    if (!d?.success) return;
    const list = d.entrants || [];
    setWheelEntrants(list);
    setLiveWinner(null);
    const target = 360 * 8 - midAngleOf(list, d.winnerIndex);
    setSpinning(true);
    setRotation(prev => prev - (prev % 360) + target);
    setTimeout(() => { setSpinning(false); setLiveWinner(d.winner); flash(`🎉 Weekly winner: ${d.winner.name}`); loadStats(); loadWinners(); }, 5600);
  };

  // poll the live pool + run the entry-window countdown
  useEffect(() => {
    if (tab !== 'live' || !authed) return;
    loadLive();
    const poll = setInterval(loadLive, 2500);
    const tick = setInterval(() => {
      setLiveInfo(info => {
        if (!info?.endsAt) { setLiveCountdown(null); return info; }
        const s = Math.max(0, Math.round((info.endsAt - Date.now()) / 1000));
        setLiveCountdown(s);
        return info;
      });
    }, 1000);
    return () => { clearInterval(poll); clearInterval(tick); };
  }, [tab, authed, loadLive]);

  // restore session
  useEffect(() => {
    let s = '';
    try { s = localStorage.getItem(KEY) || ''; } catch {}
    if (s) { setSecret(s); loadStats(s).then(ok => { if (ok === true) setAuthed(true); }); }
  }, [loadStats]);

  const login = async () => {
    setErr('');
    if (!secret) return;
    setBusy(true);
    const ok = await loadStats(secret);
    setBusy(false);
    if (ok === true) {
      setAuthed(true);
      try { localStorage.setItem(KEY, secret); } catch {}
    } else {
      const m = String(ok || '').toLowerCase();
      if (m.includes('storage')) {
        flash('The database isn\'t connected yet — open /status on this site to see exactly what\'s missing.', true);
      } else if (m.includes('unauthorized')) {
        flash('Wrong password — it must exactly match GIVEAWAY_ADMIN_SECRET in Vercel (edit it there, Redeploy, then retry).', true);
      } else {
        flash(ok || 'Something went wrong — try again.', true);
      }
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
          <a href="/status" style={{ ...S.label, display: 'block', marginTop: 10, color: CYAN, textDecoration: 'none' }}>Trouble signing in? Run the setup checkup →</a>
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
          {[['overview', 'Overview'], ['live', '🎡 Wheels'], ['proofs', `Proofs${stats?.pendingProofs ? ` (${stats.pendingProofs})` : ''}`], ['winners', 'Winners'], ['controls', 'Controls']].map(([k, l]) => (
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

        {/* ── LIVE WHEEL ── */}
        {tab === 'live' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.2fr)', gap: 16, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ ...S.card, borderColor: CYAN + '40' }}>
                <div style={{ ...S.label, marginBottom: 12, color: CYAN }}>🗓 Weekly wheel — Friday drawing</div>
                <p style={{ color: MUTED, fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
                  Puts <strong style={{ color: TEXT }}>everyone entered</strong> on the wheel — slice size matches their entries, so people who uploaded receipts get visibly bigger slices. One click loads and spins.
                </p>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{ fontSize: 13, color: MUTED, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="checkbox" checked={excludePast} onChange={e => setExcludePast(e.target.checked)} style={{ accentColor: CYAN }} /> Exclude past winners
                  </label>
                  <button style={S.btn} disabled={busy || spinning} onClick={spinWeekly}>🗓 SPIN WEEKLY WHEEL</button>
                </div>
              </div>

              <div style={S.card}>
                <div style={{ ...S.label, marginBottom: 12 }}>Wheel 1 — live round (random giveaway on stream)</div>
                <p style={{ color: MUTED, fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
                  Start a round, viewers get a window to enter at <strong style={{ color: TEXT }}>/giveaway</strong>, then spin. Only people who enter <em>during the window</em> are on the wheel.
                </p>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{ fontSize: 13, color: MUTED }}>Minutes
                    <input type="number" min={1} max={60} value={liveMinutes} onChange={e => setLiveMinutes(e.target.value)} style={{ ...S.input, width: 70, marginLeft: 6 }} />
                  </label>
                  <button style={{ ...S.btn, background: GREEN, color: '#04210f' }} disabled={busy} onClick={startLive}>▶ Start round</button>
                  {liveInfo?.active && <button style={{ ...S.ghost, color: AMBER, borderColor: AMBER + '50' }} onClick={async () => { await act('stopLive'); loadLive(); }}>⏸ Close entries</button>}
                </div>
              </div>

              <div style={{ ...S.card, borderColor: GREEN + '30' }}>
                <div style={{ ...S.label, marginBottom: 12, color: GREEN }}>Wheel 2 — code users (verified buyers)</div>
                <p style={{ color: MUTED, fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
                  One click puts everyone with an <strong style={{ color: TEXT }}>approved receipt</strong> (they used your code) onto the wheel automatically. No entry window — just load and spin.
                </p>
                <button style={{ ...S.btn }} disabled={busy} onClick={loadBuyers}>🧾 Load code-users onto wheel</button>
              </div>

              <div style={S.card}>
                <div style={{ ...S.label, marginBottom: 8 }}>Add names yourself (admin-only mode)</div>
                <p style={{ color: MUTED, fontSize: 12, marginBottom: 10, lineHeight: 1.5 }}>
                  Don't start a public round and type names here instead — only you can add. Or mix: start a round <em>and</em> add a few manually.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={liveName} onChange={e => setLiveName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addName()}
                    placeholder="Name" style={{ ...S.input, flex: 1 }} />
                  <button style={S.btn} disabled={busy || !liveName.trim()} onClick={addName}>+ Add</button>
                </div>
                {liveInfo?.count > 0 && (
                  <button style={{ ...S.ghost, color: RED, borderColor: RED + '40', marginTop: 10 }} onClick={clearPool}>Clear wheel</button>
                )}
              </div>

              <div style={{ ...S.card, textAlign: 'center' }}>
                <div style={{ ...S.label }}>Entries this round</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 48, fontWeight: 700, color: CYAN, lineHeight: 1.1 }}>{liveInfo?.count ?? 0}</div>
                {liveInfo?.open ? (
                  <div style={{ ...S.label, color: liveCountdown <= 30 ? RED : GREEN }}>
                    ● OPEN · {liveCountdown != null ? `${Math.floor(liveCountdown / 60)}:${String(liveCountdown % 60).padStart(2, '0')}` : '…'} left
                  </div>
                ) : liveInfo?.active === false && liveInfo?.count > 0 ? (
                  <div style={{ ...S.label, color: AMBER }}>Entries closed — ready to spin</div>
                ) : (
                  <div style={{ ...S.label, color: MUTED }}>No round running</div>
                )}
              </div>

              {liveInfo?.entrants?.length > 0 && (
                <div style={{ ...S.card, maxHeight: 220, overflowY: 'auto' }}>
                  <div style={{ ...S.label, marginBottom: 8 }}>In the pool</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {liveInfo.entrants.map(e => (
                      <span key={e.member} style={{ fontSize: 12, background: '#0a0f17', border: `1px solid ${BORDER}`, borderRadius: 20, padding: '4px 6px 4px 10px', color: TEXT, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {e.name}
                        <button onClick={async () => { await act('removeLiveName', { member: e.member }); loadLive(); }} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }} title="Remove">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ ...S.card, textAlign: 'center', padding: 24 }}>
              {liveWinner && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ ...S.label, color: GREEN }}>🎉 Winner</div>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 40, color: '#fff', letterSpacing: 1, lineHeight: 1 }}>{liveWinner.name}</div>
                  <div style={{ ...S.label, color: MUTED }}>{liveWinner.email}</div>
                </div>
              )}
              <Wheel entrants={wheelEntrants.length ? wheelEntrants : (liveInfo?.entrants || [])} rotation={rotation} spinning={spinning} />
              <button style={{ ...S.btn, marginTop: 20, padding: '14px 40px', fontSize: 15, background: spinning ? BORDER : CYAN, cursor: spinning ? 'wait' : 'pointer' }}
                disabled={spinning || busy || !(liveInfo?.count > 0)} onClick={spin}>
                {spinning ? 'Spinning…' : '🎡 SPIN THE WHEEL'}
              </button>
              {!(liveInfo?.count > 0) && <p style={{ ...S.label, marginTop: 10, color: MUTED }}>Waiting for entries…</p>}
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
