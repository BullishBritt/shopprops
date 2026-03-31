import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function POST(request) {
  try {
    const { name } = await request.json();

    if (!name || name.trim().length < 2) {
      return Response.json({ error: 'Please enter a valid name.' }, { status: 400 });
    }

    const cleanName = name.trim();
    const timestamp = Date.now();

    // Check if giveaway is active
    const isActive = await redis.get('giveaway:active');
    if (!isActive) {
      return Response.json({ error: 'Giveaway is not currently active.' }, { status: 403 });
    }

    // Save entry
    await redis.zadd('giveaway:entries', { score: timestamp, member: cleanName });

    const totalEntries = await redis.zcard('giveaway:entries');

    return Response.json({ success: true, totalEntries });
  } catch (error) {
    return Response.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const isActive = await redis.get('giveaway:active');
    const endDate = await redis.get('giveaway:endDate');
    const totalEntries = await redis.zcard('giveaway:entries');

    return Response.json({ isActive: !!isActive, endDate, totalEntries });
  } catch (error) {
    return Response.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
