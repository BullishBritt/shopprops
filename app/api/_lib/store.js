import { Redis } from '@upstash/redis';

// Shared Redis bootstrap. Returns null (instead of throwing) when the
// Upstash env vars are missing, so every route can degrade gracefully.
let _redis = null;
let _tried = false;

export function getRedis() {
  if (_tried) return _redis;
  _tried = true;
  try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      _redis = Redis.fromEnv();
    }
  } catch {
    _redis = null;
  }
  return _redis;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function firstName(name) {
  return String(name || '').trim().split(/\s+/)[0] || 'Trader';
}

// Public base URL for building referral links, etc.
export function baseUrlFrom(request) {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, '');
  try {
    const u = new URL(request.url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return 'https://shopprops.co';
  }
}

// Load a giveaway user hash with numeric/array coercion.
export async function loadUser(r, email) {
  const u = await r.hgetall(`giveaway:user:${email}`);
  if (!u || !u.email) return null;
  u.entries = Number(u.entries || 0);
  u.referrals = Number(u.referrals || 0);
  u.tasks = u.tasks ? String(u.tasks).split(',').filter(Boolean) : [];
  return u;
}

// Award N bonus entries to an entrant, creating a minimal entrant record
// if they haven't formally joined yet. Returns the new entry total.
export async function awardEntries(r, email, name, entries) {
  const amount = Math.max(0, Number(entries) || 0);
  const existing = await loadUser(r, email);
  if (existing) {
    const newEntries = existing.entries + amount;
    await r.hset(`giveaway:user:${email}`, { entries: newEntries });
    await r.zadd('giveaway:board', { score: newEntries, member: email });
    await r.incrby('giveaway:totalEntries', amount);
    return newEntries;
  }
  // Create a lightweight entrant for a buyer who uploaded proof first.
  const code = (email.replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase() +
    Math.random().toString(36).slice(2, 7).toUpperCase()).slice(0, 8);
  const now = Date.now();
  await r.hset(`giveaway:user:${email}`, {
    name: name || 'Trader', email, code, entries: amount, referrals: 0,
    referredBy: '', tasks: '', createdAt: now,
  });
  await r.set(`giveaway:code:${code}`, email);
  await r.zadd('giveaway:board', { score: amount, member: email });
  await r.zadd('giveaway:entrants', { score: now, member: email });
  await r.incrby('giveaway:totalEntries', amount);
  await r.lpush('giveaway:feed', firstName(name));
  await r.ltrim('giveaway:feed', 0, 29);
  return amount;
}
