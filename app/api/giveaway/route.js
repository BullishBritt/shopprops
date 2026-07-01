import { Redis } from '@upstash/redis';

// ═══════════════════════════════════════════════════════════════
// SHOPPROPS GIVEAWAY API — viral referral engine
// ───────────────────────────────────────────────────────────────
// Entry mechanics:
//   • Joining the giveaway        => +1 base entry
//   • Each friend who joins via   => +N bonus entries (REFERRAL_BONUS)
//     your unique referral link
//   • Completing a social task    => +N bonus entries (per TASKS)
//
// Redis keys:
//   giveaway:active            -> "1" when the giveaway accepts entries
//   giveaway:endDate           -> ISO string the countdown targets
//   giveaway:user:{email}      -> hash { name, email, code, entries, referrals, referredBy, tasks, createdAt }
//   giveaway:code:{code}       -> email (referral-code lookup)
//   giveaway:board             -> sorted set, score = entries, member = email
//   giveaway:entrants          -> sorted set, score = joinedAt, member = email
//   giveaway:feed              -> capped list of recent first names (social proof)
//   giveaway:totalEntries      -> integer counter (sum of all entries)
// ═══════════════════════════════════════════════════════════════

const REFERRAL_BONUS = 3; // bonus entries the referrer earns per friend
const FEED_MAX = 30;

// Bonus-entry social tasks. The `url` is where we send the user; the
// `points` is how many entries completing it awards (self-attested, once each).
const TASKS = {
  follow_x:       { points: 2, label: 'Follow @ShopProps on X' },
  follow_ig:      { points: 2, label: 'Follow ShopProps on Instagram' },
  subscribe_yt:   { points: 2, label: 'Subscribe on YouTube' },
  join_discord:   { points: 3, label: 'Join the ShopProps Discord' },
};

// Prize lineup shown on the landing page (server is the source of truth).
const PRIZES = [
  { place: '1st', emoji: '🏆', title: '$150K Funded Account', value: '$150,000', desc: 'A fully funded prop firm evaluation of the winner\'s choice — or the cash equivalent.' },
  { place: '2nd', emoji: '🥈', title: '$50K Funded Account', value: '$50,000', desc: 'A 50K evaluation at any partner prop firm, activation fees covered.' },
  { place: '3rd', emoji: '🥉', title: '$250 Trading Credit', value: '$250', desc: 'Store credit toward any prop firm evaluation on ShopProps.' },
];

// ── Redis bootstrap (degrades gracefully when env is missing) ──
let redis = null;
function getRedis() {
  if (redis) return redis;
  try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      redis = Redis.fromEnv();
    }
  } catch {
    redis = null;
  }
  return redis;
}

// ── helpers ──
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function genCode(seed) {
  // Short, URL-safe, mostly-unique referral code.
  const base = (seed || '').replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return (base + rand).slice(0, 8);
}

function firstName(name) {
  return String(name || '').trim().split(/\s+/)[0] || 'Trader';
}

async function loadUser(r, email) {
  const u = await r.hgetall(`giveaway:user:${email}`);
  if (!u || !u.email) return null;
  // Upstash returns strings; coerce numerics.
  u.entries = Number(u.entries || 0);
  u.referrals = Number(u.referrals || 0);
  u.tasks = u.tasks ? String(u.tasks).split(',').filter(Boolean) : [];
  return u;
}

async function rankFor(r, email, entries) {
  // Rank = 1 + number of people strictly ahead of you on the board.
  try {
    const ahead = await r.zcount(`giveaway:board`, `(${entries}`, '+inf');
    return (ahead || 0) + 1;
  } catch {
    return null;
  }
}

function publicUser(u, baseUrl, rank, totalEntries) {
  return {
    name: u.name,
    firstName: firstName(u.name),
    code: u.code,
    entries: u.entries,
    referrals: u.referrals,
    tasks: u.tasks,
    rank,
    referralUrl: `${baseUrl}/giveaway?ref=${u.code}`,
    totalEntries,
  };
}

function baseUrlFrom(request) {
  // Prefer the public site URL; fall back to the request origin.
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, '');
  try {
    const u = new URL(request.url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return 'https://shopprops.co';
  }
}

// Add an entrant to the current live (spin-the-wheel) pool if a round is
// open and still within its window. Used by the live TikTok giveaway mode.
async function addToLivePool(r, email) {
  try {
    if (!(await r.get('giveaway:live:active'))) return;
    const endsAt = Number(await r.get('giveaway:live:endsAt') || 0);
    if (Date.now() < endsAt) await r.zadd('giveaway:live:entrants', { score: Date.now(), member: email });
  } catch {}
}

// ── GET: giveaway status, or a single user's dashboard (?email=) ──
export async function GET(request) {
  const r = getRedis();
  const baseUrl = baseUrlFrom(request);
  const { searchParams } = new URL(request.url);
  const email = (searchParams.get('email') || '').trim().toLowerCase();

  // No Redis configured -> render a safe "coming soon" state.
  if (!r) {
    return Response.json({
      isActive: false, endDate: null, totalEntries: 0, totalEntrants: 0,
      prizes: PRIZES, tasks: TASKS, referralBonus: REFERRAL_BONUS, feed: [],
      configured: false,
    });
  }

  try {
    const [isActive, endDate, totalEntries, totalEntrants, feedRaw, liveActive, liveEndsAt, liveCount] = await Promise.all([
      r.get('giveaway:active'),
      r.get('giveaway:endDate'),
      r.get('giveaway:totalEntries'),
      r.zcard('giveaway:entrants'),
      r.lrange('giveaway:feed', 0, FEED_MAX - 1),
      r.get('giveaway:live:active'),
      r.get('giveaway:live:endsAt'),
      r.zcard('giveaway:live:entrants'),
    ]);
    const liveOn = !!liveActive && Date.now() < Number(liveEndsAt || 0);

    const payload = {
      isActive: !!isActive,
      endDate: endDate || null,
      totalEntries: Number(totalEntries || 0),
      totalEntrants: Number(totalEntrants || 0),
      prizes: PRIZES,
      tasks: TASKS,
      referralBonus: REFERRAL_BONUS,
      feed: (feedRaw || []).map(firstName),
      live: { active: liveOn, endsAt: liveOn ? Number(liveEndsAt) : null, count: Number(liveCount || 0) },
      configured: true,
    };

    if (email && EMAIL_RE.test(email)) {
      const u = await loadUser(r, email);
      if (u) {
        const rank = await rankFor(r, email, u.entries);
        payload.user = publicUser(u, baseUrl, rank, payload.totalEntries);
      }
    }

    return Response.json(payload);
  } catch (error) {
    return Response.json({
      isActive: false, endDate: null, totalEntries: 0, totalEntrants: 0,
      prizes: PRIZES, tasks: TASKS, referralBonus: REFERRAL_BONUS, feed: [],
      configured: true, error: 'temporarily_unavailable',
    });
  }
}

// ── POST: join the giveaway, or complete a bonus task ──
export async function POST(request) {
  const r = getRedis();
  if (!r) {
    return Response.json({ error: 'Giveaway is not available right now.' }, { status: 503 });
  }

  let body;
  try { body = await request.json(); } catch { body = {}; }
  const action = body.action || 'join';
  const baseUrl = baseUrlFrom(request);

  try {
    const isActive = await r.get('giveaway:active');
    if (!isActive) {
      return Response.json({ error: 'The giveaway is not currently active.' }, { status: 403 });
    }

    // ── complete a bonus task ──
    if (action === 'task') {
      const email = String(body.email || '').trim().toLowerCase();
      const taskId = String(body.task || '');
      if (!EMAIL_RE.test(email)) return Response.json({ error: 'Enter the giveaway first.' }, { status: 400 });
      if (!TASKS[taskId]) return Response.json({ error: 'Unknown task.' }, { status: 400 });

      const u = await loadUser(r, email);
      if (!u) return Response.json({ error: 'Enter the giveaway first.' }, { status: 404 });
      if (u.tasks.includes(taskId)) {
        const rank = await rankFor(r, email, u.entries);
        const totalEntries = Number(await r.get('giveaway:totalEntries') || 0);
        return Response.json({ success: true, alreadyDone: true, user: publicUser(u, baseUrl, rank, totalEntries) });
      }

      const pts = TASKS[taskId].points;
      const newTasks = [...u.tasks, taskId];
      const newEntries = u.entries + pts;
      await r.hset(`giveaway:user:${email}`, { entries: newEntries, tasks: newTasks.join(',') });
      await r.zadd('giveaway:board', { score: newEntries, member: email });
      await r.incrby('giveaway:totalEntries', pts);

      const updated = { ...u, entries: newEntries, tasks: newTasks };
      const rank = await rankFor(r, email, newEntries);
      const totalEntries = Number(await r.get('giveaway:totalEntries') || 0);
      return Response.json({ success: true, awarded: pts, user: publicUser(updated, baseUrl, rank, totalEntries) });
    }

    // ── join the giveaway ──
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const ref = String(body.ref || '').trim().toUpperCase().slice(0, 8);

    if (name.length < 2) return Response.json({ error: 'Please enter your name.' }, { status: 400 });
    if (!EMAIL_RE.test(email)) return Response.json({ error: 'Please enter a valid email.' }, { status: 400 });

    // Idempotent: returning an existing entrant their dashboard.
    const existing = await loadUser(r, email);
    if (existing) {
      await addToLivePool(r, email);
      const rank = await rankFor(r, email, existing.entries);
      const totalEntries = Number(await r.get('giveaway:totalEntries') || 0);
      return Response.json({ success: true, alreadyEntered: true, user: publicUser(existing, baseUrl, rank, totalEntries) });
    }

    // Generate a referral code that isn't already taken.
    let code = genCode(email);
    for (let i = 0; i < 5; i++) {
      const taken = await r.get(`giveaway:code:${code}`);
      if (!taken) break;
      code = genCode(email + i);
    }

    const now = Date.now();
    let referredBy = '';
    if (ref) {
      const refEmail = await r.get(`giveaway:code:${ref}`);
      if (refEmail && refEmail !== email) referredBy = refEmail;
    }

    const user = {
      name, email, code,
      entries: 1, referrals: 0, referredBy,
      tasks: '', createdAt: now,
    };
    await r.hset(`giveaway:user:${email}`, user);
    await r.set(`giveaway:code:${code}`, email);
    await r.zadd('giveaway:board', { score: 1, member: email });
    await r.zadd('giveaway:entrants', { score: now, member: email });
    await r.incr('giveaway:totalEntries');
    await r.lpush('giveaway:feed', firstName(name));
    await r.ltrim('giveaway:feed', 0, FEED_MAX - 1);

    // Credit the referrer with bonus entries.
    if (referredBy) {
      const ru = await loadUser(r, referredBy);
      if (ru) {
        const newEntries = ru.entries + REFERRAL_BONUS;
        await r.hset(`giveaway:user:${referredBy}`, { entries: newEntries, referrals: ru.referrals + 1 });
        await r.zadd('giveaway:board', { score: newEntries, member: referredBy });
        await r.incrby('giveaway:totalEntries', REFERRAL_BONUS);
      }
    }

    await addToLivePool(r, email);

    const rank = await rankFor(r, email, 1);
    const totalEntries = Number(await r.get('giveaway:totalEntries') || 0);
    return Response.json({
      success: true,
      user: publicUser({ ...user, entries: 1, referrals: 0, tasks: [] }, baseUrl, rank, totalEntries),
    });
  } catch (error) {
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
