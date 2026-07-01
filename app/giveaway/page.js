'use client';
import { useState, useEffect, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════
// SHOPPROPS GIVEAWAY — viral landing page
// Theme matches the main site: dark + cyan, Bebas/Outfit/Space Mono.
// ═══════════════════════════════════════════════════════════════

const CYAN = '#00e5ff';
const GREEN = '#22c55e';
const DARK = '#070b11';
const CARD = '#0c1119';
const BORDER = '#151d2b';
const MUTED = '#64748b';
const TEXT = '#cbd5e1';

const STORE_KEY = 'shopprops_giveaway_email';
const PROMO = 'BRITT';
const PROOF_BONUS = 25;

// Firms a buyer can attach proof to (keep in sync with the main site).
const FIRM_OPTIONS = [
  'Lucid Trading', 'Tradeify', 'Alpha Futures', 'Apex Trader Funding', 'Top One Futures',
  'My Funded Futures', 'Take Profit Trader', 'Bulenox', 'FundedNext', 'Topstep', 'Other',
];

const TASK_META = [
  { id: 'follow_x', icon: '𝕏', label: 'Follow @ShopProps on X', url: 'https://x.com' },
  { id: 'follow_ig', icon: '📸', label: 'Follow on Instagram', url: 'https://instagram.com' },
  { id: 'subscribe_yt', icon: '▶', label: 'Subscribe on YouTube', url: 'https://youtube.com' },
  { id: 'join_discord', icon: '💬', label: 'Join the Discord', url: 'https://discord.com' },
];

const FAQS = [
  { q: 'How do I enter?', a: 'Enter your name and email above — that\'s one entry. Then share your unique referral link and complete bonus tasks to rack up more entries. The more entries you have, the higher your odds.' },
  { q: 'How are bonus entries earned?', a: 'Every friend who joins through your referral link gives you +3 entries. Following our socials and joining the Discord each give you bonus entries too. Your live entry total updates instantly.' },
  { q: 'Is it really free?', a: 'Yes. There is no purchase necessary and entering is completely free. We run these giveaways to grow the ShopProps community.' },
  { q: 'How is the winner chosen?', a: 'When the countdown hits zero, a winner is drawn at random — weighted by entry count. More entries means a better chance, but everyone with at least one entry can win.' },
  { q: 'When and how will I be notified?', a: 'Winners are announced after the giveaway closes and contacted directly at the email used to enter. Make sure you use a real email you check.' },
  { q: 'What can I win?', a: 'A fully funded prop firm account (or its cash equivalent), plus runner-up evaluations and trading credit. See the full prize lineup above.' },
];

export default function GiveawayPage() {
  const [info, setInfo] = useState(null);
  const [user, setUser] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [agree, setAgree] = useState(false);
  const [ref, setRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [pendingTask, setPendingTask] = useState(null);
  const [toast, setToast] = useState('');
  // proof-of-code upload
  const [pFirm, setPFirm] = useState('');
  const [pCode, setPCode] = useState(PROMO);
  const [pAmount, setPAmount] = useState('');
  const [pFile, setPFile] = useState(null);
  const [pLoading, setPLoading] = useState(false);
  const [pError, setPError] = useState('');
  const [pHistory, setPHistory] = useState([]);
  const [liveLeft, setLiveLeft] = useState(null);

  // ── load status + capture ?ref + restore saved entrant ──
  const fetchStatus = useCallback(async (em) => {
    try {
      const qs = em ? `?email=${encodeURIComponent(em)}` : '';
      const res = await fetch('/api/giveaway' + qs);
      const data = await res.json();
      setInfo(data);
      if (data.user) setUser(data.user);
      return data;
    } catch {
      setInfo({ isActive: false, prizes: [], feed: [], totalEntries: 0, totalEntrants: 0 });
    }
  }, []);

  useEffect(() => {
    let savedEmail = '';
    try {
      const params = new URLSearchParams(window.location.search);
      const r = params.get('ref');
      if (r) setRef(r.toUpperCase().slice(0, 8));
      savedEmail = localStorage.getItem(STORE_KEY) || '';
    } catch {}
    fetchStatus(savedEmail);
  }, [fetchStatus]);

  // ── countdown ──
  useEffect(() => {
    if (!info?.endDate) { setTimeLeft(null); return; }
    const tick = () => {
      const diff = new Date(info.endDate) - new Date();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, ended: true }); return; }
      setTimeLeft({
        days: Math.floor(diff / 864e5),
        hours: Math.floor((diff / 36e5) % 24),
        minutes: Math.floor((diff / 6e4) % 60),
        seconds: Math.floor((diff / 1e3) % 60),
      });
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [info]);

  // Live-round ticker + light polling so the LIVE banner appears without a reload.
  useEffect(() => {
    const savedEmail = () => { try { return localStorage.getItem(STORE_KEY) || ''; } catch { return ''; } };
    const refetch = setInterval(() => fetchStatus(savedEmail()), 15000);
    const tick = setInterval(() => {
      const endsAt = info?.live?.endsAt;
      if (info?.live?.active && endsAt) setLiveLeft(Math.max(0, Math.round((endsAt - Date.now()) / 1000)));
      else setLiveLeft(null);
    }, 1000);
    return () => { clearInterval(refetch); clearInterval(tick); };
  }, [info, fetchStatus]);

  const isActive = info?.isActive;
  const liveOn = info?.live?.active && liveLeft != null && liveLeft > 0;

  const handleJoin = async () => {
    setError('');
    if (name.trim().length < 2) return setError('Please enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Please enter a valid email.');
    if (!agree) return setError('Please agree to the giveaway rules.');
    setLoading(true);
    try {
      const res = await fetch('/api/giveaway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', name: name.trim(), email: email.trim(), ref }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        try { localStorage.setItem(STORE_KEY, email.trim().toLowerCase()); } catch {}
        fetchStatus(email.trim().toLowerCase());
        setToast(data.alreadyEntered ? 'Welcome back — here\'s your dashboard.' : 'You\'re in! Share your link for more entries 🎉');
        setTimeout(() => setToast(''), 4000);
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch {
      setError('Something went wrong. Try again.');
    }
    setLoading(false);
  };

  const copyLink = () => {
    if (!user?.referralUrl) return;
    navigator.clipboard?.writeText(user.referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const doTask = async (task) => {
    if (!user || user.tasks?.includes(task.id)) return;
    // Open the social link, then mark the task complete.
    try { window.open(task.url, '_blank', 'noopener'); } catch {}
    setPendingTask(task.id);
    try {
      const res = await fetch('/api/giveaway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'task', email: email.trim().toLowerCase() || user.email, task: task.id }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        if (data.awarded) { setToast(`+${data.awarded} entries!`); setTimeout(() => setToast(''), 3000); }
      }
    } catch {}
    setPendingTask(null);
  };

  const fetchProofs = useCallback(async (em) => {
    if (!em) return;
    try {
      const res = await fetch('/api/proof?email=' + encodeURIComponent(em));
      const data = await res.json();
      setPHistory(data.proofs || []);
    } catch {}
  }, []);

  useEffect(() => {
    const em = (user?.email || email || '').trim().toLowerCase();
    if (em) fetchProofs(em);
  }, [user, fetchProofs]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitProof = async () => {
    setPError('');
    const em = (user?.email || email || '').trim().toLowerCase();
    const nm = (user?.name || name || '').trim();
    if (nm.length < 2) return setPError('Enter your name above first.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return setPError('Enter a valid email above first.');
    if (!pFirm) return setPError('Pick which prop firm you bought from.');
    if (!pCode.trim()) return setPError('Enter the code you used.');
    if (!pFile) return setPError('Attach a screenshot or receipt.');
    setPLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', nm); fd.append('email', em); fd.append('firm', pFirm);
      fd.append('code', pCode.trim()); fd.append('amount', pAmount.trim()); fd.append('image', pFile);
      const res = await fetch('/api/proof', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        setPFile(null); setPAmount('');
        setToast('Proof submitted — bonus entries land once approved! 🧾');
        setTimeout(() => setToast(''), 4500);
        fetchProofs(em);
      } else {
        setPError(data.error || 'Upload failed.');
      }
    } catch {
      setPError('Upload failed. Try again.');
    }
    setPLoading(false);
  };

  const shareUrl = user?.referralUrl || '';
  const shareText = encodeURIComponent('I just entered the ShopProps giveaway to win a funded prop account 🚀 Enter free:');
  const shareLinks = [
    { label: 'X', color: '#1d9bf0', href: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}` },
    { label: 'Facebook', color: '#1877f2', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { label: 'WhatsApp', color: '#25d366', href: `https://wa.me/?text=${shareText}%20${encodeURIComponent(shareUrl)}` },
    { label: 'Telegram', color: '#0088cc', href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${shareText}` },
  ];

  // ── styles ──
  const S = {
    btn: { padding: '14px 28px', background: CYAN, color: DARK, fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 14, letterSpacing: 1, border: 'none', cursor: 'pointer', borderRadius: 6, transition: 'all .2s' },
    input: { width: '100%', padding: '15px 16px', background: '#0a0f17', border: `1px solid ${BORDER}`, borderRadius: 8, color: '#fff', fontSize: 15, boxSizing: 'border-box', outline: 'none', fontFamily: "'Outfit',sans-serif" },
    card: { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16 },
    label: { fontFamily: "'Space Mono',monospace", fontSize: 10, color: MUTED, letterSpacing: 1.5, textTransform: 'uppercase' },
  };

  const prizes = info?.prizes || [];
  const feed = info?.feed || [];

  return (
    <div style={{ minHeight: '100vh', background: DARK, color: TEXT, fontFamily: "'Outfit',sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        a { color: inherit; }
        ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-thumb { background:${BORDER}; border-radius:3px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 40px rgba(0,229,255,.10)} 50%{box-shadow:0 0 70px rgba(0,229,255,.22)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        .fade { animation: fadeUp .6s ease-out both; }
        .glow { animation: glow 3.5s ease-in-out infinite; }
        .gv-input:focus { border-color:${CYAN} !important; }
        .gv-btn:hover { filter:brightness(1.08); transform:translateY(-1px); }
        .gv-prize:hover { transform:translateY(-4px); border-color:${CYAN}40 !important; }
        .gv-task:hover { border-color:${CYAN}50 !important; }
        .gv-share:hover { filter:brightness(1.12); transform:translateY(-1px); }
        .grad-text { background:linear-gradient(90deg,#fff,${CYAN},#fff); background-size:200% auto; -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; animation:shimmer 4s linear infinite; }
        .marquee-track { display:flex; gap:40px; white-space:nowrap; animation:marquee 28s linear infinite; }
        @media(max-width:640px){ .hero-h1{ font-size:2.6rem !important; } }
      `}</style>

      {/* toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 200, background: GREEN, color: '#000', padding: '12px 22px', borderRadius: 30, fontWeight: 700, fontSize: 14, boxShadow: '0 10px 40px rgba(34,197,94,.4)' }}>
          {toast}
        </div>
      )}

      {/* top bar */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, padding: '0 24px', position: 'sticky', top: 0, background: DARK + 'f0', backdropFilter: 'blur(20px)', zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <img src="/shop_props_logo.png" alt="ShopProps" style={{ height: 34, width: 'auto' }} />
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: '#fff', letterSpacing: 1 }}><span style={{ color: CYAN }}>SHOP</span>PROPS</span>
          </a>
          <a href="/" style={{ ...S.label, textDecoration: 'none', color: MUTED }}>← Back to site</a>
        </div>
      </div>

      {/* ── LIVE ROUND BANNER ── */}
      {liveOn && (
        <a href="#enter" style={{ display: 'block', textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(90deg,#dc2626,#ef4444)', color: '#fff', padding: '12px 24px', textAlign: 'center', fontWeight: 700, fontSize: 15, display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#fff', animation: 'pulse 1s infinite' }} /> LIVE GIVEAWAY
            </span>
            <span>Enter now — spinning the wheel in</span>
            <span style={{ fontFamily: "'Space Mono',monospace", background: 'rgba(0,0,0,.25)', padding: '2px 10px', borderRadius: 6 }}>
              {Math.floor(liveLeft / 60)}:{String(liveLeft % 60).padStart(2, '0')}
            </span>
            <span style={{ opacity: .9 }}>· {info?.live?.count ?? 0} in</span>
          </div>
        </a>
      )}

      {/* ── HERO ── */}
      <section style={{ maxWidth: 980, margin: '0 auto', padding: '70px 24px 40px', textAlign: 'center' }} className="fade">
        <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 30, border: `1px solid ${GREEN}40`, background: `${GREEN}12`, color: GREEN, fontFamily: "'Space Mono',monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 28 }}>
          🎁 The ShopProps Funded Account Giveaway
        </div>
        <h1 className="hero-h1" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(3rem,9vw,6rem)', lineHeight: 0.92, letterSpacing: 1, color: '#fff', marginBottom: 22 }}>
          Win A <span className="grad-text">Fully Funded</span><br />Prop Firm Account
        </h1>
        <p style={{ fontSize: 18, color: MUTED, maxWidth: 600, margin: '0 auto 36px', lineHeight: 1.6 }}>
          Enter free in seconds. Share your link and complete bonus tasks to multiply your entries.
          One winner takes a fully funded account — or the cash.
        </p>

        {/* countdown */}
        {timeLeft && !timeLeft.ended && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
            {[['Days', timeLeft.days], ['Hours', timeLeft.hours], ['Mins', timeLeft.minutes], ['Secs', timeLeft.seconds]].map(([l, v]) => (
              <div key={l} style={{ ...S.card, minWidth: 78, padding: '14px 10px' }}>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 34, fontWeight: 700, color: CYAN, lineHeight: 1 }}>{String(v).padStart(2, '0')}</div>
                <div style={{ ...S.label, marginTop: 6 }}>{l}</div>
              </div>
            ))}
          </div>
        )}
        {timeLeft?.ended && (
          <div style={{ ...S.card, display: 'inline-block', padding: '14px 24px', color: '#f59e0b', borderColor: '#f59e0b40', marginBottom: 18 }}>
            ⏰ This giveaway has closed — winner being drawn!
          </div>
        )}

        {/* live counters */}
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', marginTop: 10 }}>
          <div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 26, fontWeight: 700, color: '#fff' }}>{(info?.totalEntrants ?? 0).toLocaleString()}</div>
            <div style={S.label}>People Entered</div>
          </div>
          <div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 26, fontWeight: 700, color: CYAN }}>{(info?.totalEntries ?? 0).toLocaleString()}</div>
            <div style={S.label}>Total Entries</div>
          </div>
        </div>

        {!isActive && info && (
          <div style={{ ...S.card, maxWidth: 460, margin: '36px auto 0', padding: 24, color: MUTED }}>
            {info.configured === false
              ? 'The giveaway will open soon — check back shortly! 👀'
              : 'Entries are currently closed. Follow our socials so you don\'t miss the next drop. 👀'}
          </div>
        )}
      </section>

      {/* recent-entrants marquee */}
      {feed.length > 3 && (
        <div style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: '12px 0', overflow: 'hidden', maskImage: 'linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)' }}>
          <div className="marquee-track">
            {[...feed, ...feed].map((n, i) => (
              <span key={i} style={{ ...S.label, color: MUTED, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, display: 'inline-block' }} /> {n} just entered
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── PRIZES ── */}
      {prizes.length > 0 && (
        <section style={{ maxWidth: 1000, margin: '0 auto', padding: '64px 24px 24px' }}>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2rem,5vw,3rem)', color: '#fff', textAlign: 'center', letterSpacing: 1, marginBottom: 8 }}>The Prize Pool</h2>
          <p style={{ textAlign: 'center', color: MUTED, marginBottom: 36 }}>Three winners. Real funded capital.</p>
          <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
            {prizes.map((p, i) => (
              <div key={p.place} className="gv-prize" style={{ ...S.card, padding: 28, textAlign: 'center', transition: 'all .3s', borderColor: i === 0 ? `${CYAN}40` : BORDER, ...(i === 0 ? { animation: 'glow 3.5s ease-in-out infinite' } : {}) }}>
                <div style={{ fontSize: 44, marginBottom: 10 }}>{p.emoji}</div>
                <div style={{ ...S.label, color: i === 0 ? CYAN : MUTED, marginBottom: 8 }}>{p.place} Place</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: '#fff', letterSpacing: 0.5, lineHeight: 1 }}>{p.title}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 22, color: i === 0 ? CYAN : '#fff', margin: '10px 0' }}>{p.value}</div>
                <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.5 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── ENTRY / DASHBOARD ── */}
      <section id="enter" style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px 24px', scrollMarginTop: 80 }}>
        {!user ? (
          <div style={{ ...S.card, padding: 36 }} className="glow">
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: '#fff', letterSpacing: 1, textAlign: 'center', marginBottom: 6 }}>Enter The Giveaway</h2>
            <p style={{ textAlign: 'center', color: MUTED, fontSize: 14, marginBottom: 24 }}>Free to enter. Takes 10 seconds.</p>
            {ref && (
              <div style={{ background: `${GREEN}12`, border: `1px solid ${GREEN}30`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: GREEN, textAlign: 'center' }}>
                🤝 You were invited by a friend — they'll earn bonus entries when you join.
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input className="gv-input" style={S.input} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} disabled={!isActive} />
              <input className="gv-input" style={S.input} type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} disabled={!isActive} onKeyDown={e => e.key === 'Enter' && handleJoin()} />
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: MUTED, fontSize: 13, cursor: 'pointer', margin: '4px 0' }}>
                <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} style={{ accentColor: CYAN, marginTop: 2 }} />
                <span>I'm 18+ and agree to the giveaway rules. No purchase necessary.</span>
              </label>
              {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}
              <button className="gv-btn" style={{ ...S.btn, width: '100%', opacity: isActive ? 1 : 0.5, cursor: isActive ? 'pointer' : 'not-allowed' }} onClick={handleJoin} disabled={loading || !isActive}>
                {loading ? 'Entering…' : isActive ? 'Enter Giveaway →' : 'Entries Closed'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ ...S.card, padding: 36 }} className="fade">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ ...S.label, color: GREEN }}>✓ You're entered, {user.firstName}</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 64, color: CYAN, lineHeight: 1, margin: '8px 0' }}>{user.entries}</div>
              <div style={S.label}>{user.entries === 1 ? 'Entry' : 'Entries'} {user.rank ? `· Rank #${user.rank}` : ''}</div>
            </div>

            {/* referral link */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ ...S.label, marginBottom: 8 }}>Your referral link — +{info?.referralBonus || 3} entries per friend</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input readOnly value={user.referralUrl} style={{ ...S.input, fontSize: 13, fontFamily: "'Space Mono',monospace" }} onFocus={e => e.target.select()} />
                <button className="gv-btn" style={{ ...S.btn, padding: '0 18px', whiteSpace: 'nowrap', background: copied ? GREEN : CYAN }} onClick={copyLink}>{copied ? '✓ Copied' : 'Copy'}</button>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {shareLinks.map(s => (
                  <a key={s.label} className="gv-share" href={s.href} target="_blank" rel="noopener noreferrer" style={{ flex: '1 1 auto', textAlign: 'center', padding: '10px 8px', borderRadius: 8, background: s.color, color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none', transition: 'all .2s' }}>
                    {s.label}
                  </a>
                ))}
              </div>
              {user.referrals > 0 && (
                <p style={{ ...S.label, color: GREEN, marginTop: 10, textAlign: 'center' }}>🔥 {user.referrals} friend{user.referrals > 1 ? 's' : ''} joined through your link</p>
              )}
            </div>

            {/* bonus tasks */}
            <div>
              <div style={{ ...S.label, marginBottom: 8 }}>Bonus entries</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {TASK_META.map(t => {
                  const done = user.tasks?.includes(t.id);
                  const pts = info?.tasks?.[t.id]?.points || 2;
                  return (
                    <button key={t.id} className="gv-task" onClick={() => doTask(t)} disabled={done || pendingTask === t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: `1px solid ${done ? GREEN + '40' : BORDER}`, background: done ? GREEN + '10' : '#0a0f17', color: TEXT, cursor: done ? 'default' : 'pointer', transition: 'all .2s', textAlign: 'left' }}>
                      <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{t.icon}</span>
                      <span style={{ flex: 1, fontSize: 14 }}>{t.label}</span>
                      <span style={{ ...S.label, color: done ? GREEN : CYAN }}>{done ? '✓ Done' : pendingTask === t.id ? '…' : `+${pts}`}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── PROOF OF CODE → BONUS ENTRIES ── */}
      <section style={{ maxWidth: 560, margin: '0 auto', padding: '24px 24px' }}>
        <div style={{ ...S.card, padding: 36, borderColor: `${GREEN}30`, background: `linear-gradient(180deg,${GREEN}08,transparent)` }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 34 }}>🧾</span>
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: '#fff', letterSpacing: 1, textAlign: 'center', marginBottom: 6 }}>
            Used code <span style={{ color: GREEN }}>{PROMO}</span>? Get +{PROOF_BONUS} entries
          </h2>
          <p style={{ textAlign: 'center', color: MUTED, fontSize: 14, marginBottom: 22 }}>
            Bought a prop firm eval with code <strong style={{ color: TEXT }}>{PROMO}</strong>? Upload your receipt or order screenshot.
            Once we verify it, {PROOF_BONUS} bonus entries get added to your name.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <select className="gv-input" style={{ ...S.input, appearance: 'none' }} value={pFirm} onChange={e => setPFirm(e.target.value)}>
              <option value="">Which prop firm?</option>
              {FIRM_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 10 }}>
              <input className="gv-input" style={{ ...S.input, flex: 1 }} placeholder="Code used" value={pCode} onChange={e => setPCode(e.target.value.toUpperCase())} />
              <input className="gv-input" style={{ ...S.input, flex: 1 }} placeholder="Order $ (optional)" value={pAmount} onChange={e => setPAmount(e.target.value)} />
            </div>
            <label style={{ display: 'block', border: `1px dashed ${pFile ? GREEN : BORDER}`, borderRadius: 10, padding: '18px 14px', textAlign: 'center', cursor: 'pointer', color: pFile ? GREEN : MUTED, fontSize: 14, transition: 'all .2s' }}>
              {pFile ? `✓ ${pFile.name}` : '📎 Attach receipt / screenshot (PNG, JPG, PDF · max 8MB)'}
              <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={e => setPFile(e.target.files?.[0] || null)} />
            </label>
            {pError && <p style={{ color: '#f87171', fontSize: 13 }}>{pError}</p>}
            {!user && <p style={{ color: MUTED, fontSize: 12 }}>Tip: enter the giveaway above first so your bonus attaches to your entries.</p>}
            <button className="gv-btn" style={{ ...S.btn, width: '100%', background: GREEN, color: '#04210f', opacity: isActive ? 1 : 0.5, cursor: isActive ? 'pointer' : 'not-allowed' }} onClick={submitProof} disabled={pLoading || !isActive}>
              {pLoading ? 'Uploading…' : isActive ? `Submit Proof → +${PROOF_BONUS}` : 'Entries Closed'}
            </button>
          </div>

          {pHistory.length > 0 && (
            <div style={{ marginTop: 20, borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
              <div style={{ ...S.label, marginBottom: 10 }}>Your submissions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pHistory.map(p => {
                  const c = p.status === 'approved' ? GREEN : p.status === 'rejected' ? '#f87171' : '#f59e0b';
                  return (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: TEXT }}>
                      <span>{p.firm} · <span style={{ ...S.label, color: MUTED }}>{p.code}</span></span>
                      <span style={{ color: c, fontWeight: 600, textTransform: 'capitalize' }}>
                        {p.status === 'approved' ? `✓ +${p.entriesAwarded}` : p.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2rem,5vw,3rem)', color: '#fff', textAlign: 'center', letterSpacing: 1, marginBottom: 36 }}>How It Works</h2>
        <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
          {[
            { n: '01', t: 'Enter free', d: 'Drop your name and email. That\'s your first entry — no payment, ever.' },
            { n: '02', t: 'Share your link', d: 'Every friend who joins through your unique link earns you +3 bonus entries.' },
            { n: '03', t: 'Stack & win', d: 'Complete bonus tasks for even more entries. More entries, better odds.' },
          ].map(s => (
            <div key={s.n} style={{ ...S.card, padding: 28 }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 14, color: CYAN, marginBottom: 12 }}>{s.n}</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: '#fff', letterSpacing: 0.5, marginBottom: 8 }}>{s.t}</div>
              <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.55 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '24px 24px 64px' }}>
        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2rem,5vw,3rem)', color: '#fff', textAlign: 'center', letterSpacing: 1, marginBottom: 28 }}>FAQ</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FAQS.map((f, i) => (
            <div key={i} style={{ ...S.card, overflow: 'hidden' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '18px 20px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 600, fontFamily: "'Outfit',sans-serif", textAlign: 'left' }}>
                {f.q}
                <span style={{ color: CYAN, fontSize: 22, flexShrink: 0, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
              </button>
              {openFaq === i && <p style={{ padding: '0 20px 18px', color: MUTED, fontSize: 14, lineHeight: 1.6 }}>{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: '36px 24px', textAlign: 'center', background: CARD }}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 14 }}>
          <img src="/shop_props_logo.png" alt="ShopProps" style={{ height: 28 }} />
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: '#fff', letterSpacing: 1 }}><span style={{ color: CYAN }}>SHOP</span>PROPS</span>
        </a>
        <p style={{ color: MUTED, fontSize: 12, maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
          No purchase necessary. Must be 18+ to enter. Winner selected at random (weighted by entries) after the giveaway ends and notified by email.
          ShopProps giveaways are not sponsored, endorsed, or administered by any social platform.
        </p>
        <p style={{ color: '#334155', fontSize: 12, marginTop: 14 }}>© {new Date().getFullYear()} ShopProps. All rights reserved.</p>
      </footer>
    </div>
  );
}
