import { Redis } from '@upstash/redis';

// ═══════════════════════════════════════════════════════════════
// /status — plain-English setup checkup page.
// Renders on the server on every visit (no caching) and reports
// which pieces of config are working. Shows only pass/fail — never
// secret values. Safe to visit; blocked from search indexing.
// ═══════════════════════════════════════════════════════════════

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Setup Status · ShopProps',
  robots: { index: false, follow: false },
};

async function runChecks() {
  const url = process.env.UPSTASH_REDIS_REST_URL || '';
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || '';
  const adminSecret = process.env.GIVEAWAY_ADMIN_SECRET || '';
  const blob = process.env.BLOB_READ_WRITE_TOKEN || '';

  const checks = [];

  checks.push({
    name: 'Database URL (UPSTASH_REDIS_REST_URL)',
    ok: !!url,
    fix: 'Vercel → shopprops → Environment Variables → add UPSTASH_REDIS_REST_URL, then Redeploy.',
  });
  checks.push({
    name: 'Database token (UPSTASH_REDIS_REST_TOKEN)',
    ok: !!token,
    fix: 'Vercel → shopprops → Environment Variables → add UPSTASH_REDIS_REST_TOKEN, then Redeploy.',
  });

  // Real connection test — catches typos in the values, not just absence.
  let connOk = false;
  let connNote = 'Skipped — add the two database keys first.';
  if (url && token) {
    try {
      const r = new Redis({ url, token });
      const pong = await r.ping();
      connOk = String(pong).toUpperCase() === 'PONG';
      connNote = connOk ? '' : 'Unexpected reply from database.';
    } catch (e) {
      connOk = false;
      connNote = 'Keys are set but the connection failed — one of the two values is probably mistyped (extra quote, space, or missing character). Re-copy both from Upstash and paste them again, then Redeploy.';
    }
  }
  checks.push({ name: 'Database connection test', ok: connOk, fix: connNote });

  checks.push({
    name: 'Admin password (GIVEAWAY_ADMIN_SECRET)',
    ok: !!adminSecret,
    fix: 'Vercel → shopprops → Environment Variables → add GIVEAWAY_ADMIN_SECRET (this is your /admin login), then Redeploy.',
  });

  checks.push({
    name: 'Receipt image storage (BLOB_READ_WRITE_TOKEN)',
    ok: !!blob,
    optional: true,
    fix: 'Vercel → Storage → your Blob store → Connect Project → shopprops, then Redeploy. (Optional: entries + the wheel work without it; only receipt photos need it.)',
  });

  const required = checks.filter(c => !c.optional);
  const allGood = required.every(c => c.ok);
  return { checks, allGood };
}

export default async function StatusPage() {
  const { checks, allGood } = await runChecks();

  const wrap = { minHeight: '100vh', background: '#070b11', color: '#cbd5e1', fontFamily: 'system-ui, sans-serif', padding: '40px 20px' };
  const card = { maxWidth: 640, margin: '0 auto', background: '#0c1119', border: '1px solid #151d2b', borderRadius: 16, padding: 28 };
  const row = { display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid #151d2b', alignItems: 'flex-start' };

  return (
    <div style={wrap}>
      <div style={card}>
        <h1 style={{ color: '#fff', fontSize: 22, marginBottom: 4 }}>
          ShopProps setup checkup
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 8 }}>
          This page re-checks live every time you refresh it.
        </p>

        <div style={{
          padding: '12px 16px', borderRadius: 10, margin: '14px 0 6px', fontWeight: 700, fontSize: 15,
          background: allGood ? '#22c55e18' : '#f59e0b18',
          border: `1px solid ${allGood ? '#22c55e50' : '#f59e0b50'}`,
          color: allGood ? '#22c55e' : '#f59e0b',
        }}>
          {allGood
            ? '✅ Everything required is working. Go log in at /admin — if the password is rejected there, the password itself is the only remaining issue.'
            : '⚠️ Not ready yet — fix the ✗ items below, then Redeploy in Vercel and refresh this page.'}
        </div>

        {checks.map((c) => (
          <div key={c.name} style={row}>
            <div style={{ fontSize: 18, lineHeight: 1.2 }}>{c.ok ? '✅' : c.optional ? '🟡' : '❌'}</div>
            <div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
                {c.name} {c.optional ? <span style={{ color: '#64748b', fontWeight: 400 }}>(optional)</span> : null}
              </div>
              {!c.ok && c.fix ? (
                <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{c.fix}</div>
              ) : null}
            </div>
          </div>
        ))}

        <p style={{ color: '#475569', fontSize: 12, marginTop: 18, lineHeight: 1.6 }}>
          Remember: after ANY change to Environment Variables, you must Redeploy
          (Vercel → Deployments → ⋯ → Redeploy) before it takes effect.
        </p>
      </div>
    </div>
  );
}
