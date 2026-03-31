'use client';
import { useState, useEffect } from 'react';

export default function GiveawayPage() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [giveawayInfo, setGiveawayInfo] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    fetch('/api/giveaway')
      .then(r => r.json())
      .then(data => setGiveawayInfo(data));
  }, []);

  useEffect(() => {
    if (!giveawayInfo?.endDate) return;
    const interval = setInterval(() => {
      const diff = new Date(giveawayInfo.endDate) - new Date();
      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(interval);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);
    return () => clearInterval(interval);
  }, [giveawayInfo]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/giveaway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setMessage(`You're entered, ${name}! Good luck 🎉`);
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Try again.');
    }
    setLoading(false);
  };

  const isActive = giveawayInfo?.isActive;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: 'sans-serif',
    }}>
      {/* Logo */}
      <a href="/" style={{ marginBottom: '40px' }}>
        <img src="/shopprops-logo.png" alt="ShopProps" style={{ height: '40px' }} />
      </a>

      <div style={{
        background: '#111',
        border: '1px solid #222',
        borderRadius: '16px',
        padding: '48px 40px',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎁</div>
        <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
          ShopProps Giveaway
        </h1>
        <p style={{ color: '#888', fontSize: '15px', marginBottom: '32px' }}>
          Win a free prop firm evaluation. Enter your name below.
        </p>

        {/* Countdown */}
        {timeLeft && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
            {[['days', timeLeft.days], ['hrs', timeLeft.hours], ['min', timeLeft.minutes], ['sec', timeLeft.seconds]].map(([label, val]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ color: '#00e5ff', fontSize: '28px', fontWeight: '700' }}>
                  {String(val).padStart(2, '0')}
                </div>
                <div style={{ color: '#555', fontSize: '11px', textTransform: 'uppercase' }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Total entries */}
        {giveawayInfo?.totalEntries > 0 && (
          <p style={{ color: '#555', fontSize: '13px', marginBottom: '24px' }}>
            {giveawayInfo.totalEntries} {giveawayInfo.totalEntries === 1 ? 'person has' : 'people have'} entered
          </p>
        )}

        {!isActive ? (
          <div style={{
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '10px',
            padding: '24px',
            color: '#666',
            fontSize: '15px',
          }}>
            Giveaway coming soon. Check back soon! 👀
          </div>
        ) : status === 'success' ? (
          <div style={{
            background: '#0d2b1a',
            border: '1px solid #1a5c35',
            borderRadius: '10px',
            padding: '24px',
            color: '#4ade80',
            fontSize: '16px',
            fontWeight: '600',
          }}>
            {message}
          </div>
        ) : (
          <>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '15px',
                marginBottom: '12px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
            {status === 'error' && (
              <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '12px' }}>{message}</p>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading || !name.trim()}
              style={{
                width: '100%',
                padding: '14px',
                background: loading || !name.trim() ? '#333' : '#00e5ff',
                color: loading || !name.trim() ? '#666' : '#000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {loading ? 'Entering...' : 'Enter Giveaway →'}
            </button>
          </>
        )}
      </div>

      <p style={{ color: '#333', fontSize: '12px', marginTop: '24px' }}>
        © ShopProps. Winner selected randomly after giveaway ends.
      </p>
    </div>
  );
}
