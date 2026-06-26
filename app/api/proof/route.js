import { put } from '@vercel/blob';
import { getRedis, EMAIL_RE, baseUrlFrom } from '../_lib/store';

// ═══════════════════════════════════════════════════════════════
// PROOF-OF-CODE UPLOAD — "I used code BRITT" receipt submissions
// ───────────────────────────────────────────────────────────────
// A trader who used the promo code uploads a receipt/screenshot to
// earn a big bonus toward the giveaway. Submissions are reviewed by
// an admin (see /api/giveaway/admin) and, when approved, grant
// PROOF_BONUS entries to that email's giveaway record.
//
// Redis keys:
//   proof:{id}            -> hash with all submission fields
//   proof:pending         -> sorted set (score=createdAt, member=id)
//   proof:all             -> sorted set (score=createdAt, member=id)
//   proof:byEmail:{email} -> set of submission ids
// Image bytes live in Vercel Blob (when BLOB_READ_WRITE_TOKEN is set).
// ═══════════════════════════════════════════════════════════════

export const runtime = 'nodejs';
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const OK_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic', 'application/pdf'];

function genId() {
  return 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ── GET: a single email's proof history (?email=) ──
export async function GET(request) {
  const r = getRedis();
  if (!r) return Response.json({ proofs: [], configured: false });
  const { searchParams } = new URL(request.url);
  const email = (searchParams.get('email') || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return Response.json({ proofs: [] });
  try {
    const ids = await r.smembers(`proof:byEmail:${email}`);
    const proofs = [];
    for (const id of ids || []) {
      const p = await r.hgetall(`proof:${id}`);
      if (p && p.id) proofs.push({ id: p.id, firm: p.firm, code: p.code, status: p.status, createdAt: Number(p.createdAt || 0), entriesAwarded: Number(p.entriesAwarded || 0) });
    }
    proofs.sort((a, b) => b.createdAt - a.createdAt);
    return Response.json({ proofs, configured: true });
  } catch {
    return Response.json({ proofs: [], error: 'unavailable' });
  }
}

// ── POST: submit a proof (multipart form-data) ──
export async function POST(request) {
  const r = getRedis();
  if (!r) return Response.json({ error: 'Submissions are not available right now.' }, { status: 503 });

  let form;
  try { form = await request.formData(); } catch {
    return Response.json({ error: 'Invalid submission.' }, { status: 400 });
  }

  const name = String(form.get('name') || '').trim();
  const email = String(form.get('email') || '').trim().toLowerCase();
  const firm = String(form.get('firm') || '').trim().slice(0, 60);
  const code = String(form.get('code') || '').trim().slice(0, 40).toUpperCase();
  const amount = String(form.get('amount') || '').trim().slice(0, 20);
  const file = form.get('image');

  if (name.length < 2) return Response.json({ error: 'Please enter your name.' }, { status: 400 });
  if (!EMAIL_RE.test(email)) return Response.json({ error: 'Please enter a valid email.' }, { status: 400 });
  if (!firm) return Response.json({ error: 'Please select which prop firm.' }, { status: 400 });
  if (!code) return Response.json({ error: 'Please enter the code you used.' }, { status: 400 });

  try {
    // Rate-limit: cap pending submissions per email to curb spam.
    const existingIds = await r.smembers(`proof:byEmail:${email}`);
    if ((existingIds || []).length >= 15) {
      return Response.json({ error: 'Too many submissions on this email.' }, { status: 429 });
    }

    // Upload the image to Vercel Blob when configured; otherwise record
    // a text-only submission the admin can still review.
    let imageUrl = '';
    let imageNote = '';
    if (file && typeof file === 'object' && file.size) {
      if (file.size > MAX_BYTES) return Response.json({ error: 'File too large (max 8 MB).' }, { status: 400 });
      if (file.type && !OK_TYPES.includes(file.type)) return Response.json({ error: 'Unsupported file type. Use an image or PDF.' }, { status: 400 });
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const ext = (file.name && file.name.includes('.')) ? file.name.split('.').pop().slice(0, 5) : 'png';
        const blob = await put(`proofs/${email}/${genId()}.${ext}`, file, { access: 'public', addRandomSuffix: true });
        imageUrl = blob.url;
      } else {
        imageNote = 'image_received_no_blob_storage';
      }
    } else {
      imageNote = 'no_image_attached';
    }

    const id = genId();
    const now = Date.now();
    await r.hset(`proof:${id}`, {
      id, name, email, firm, code, amount, imageUrl, imageNote,
      status: 'pending', round: Number(await r.get('giveaway:round') || 1),
      entriesAwarded: 0, createdAt: now,
    });
    await r.zadd('proof:pending', { score: now, member: id });
    await r.zadd('proof:all', { score: now, member: id });
    await r.sadd(`proof:byEmail:${email}`, id);

    return Response.json({
      success: true,
      id,
      status: 'pending',
      message: 'Proof submitted! It\'ll be reviewed and your bonus entries added once approved.',
      hasImage: !!imageUrl,
    });
  } catch (error) {
    return Response.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
