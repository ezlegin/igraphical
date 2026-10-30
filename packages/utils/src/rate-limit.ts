/**
 * Minimal in-process rate limiter.
 *
 * The OTP flows previously relied on an attempt counter held in React state
 * (`failedAttempts >= 3`), which resets on every page refresh, so there was no
 * server-side limit at all. This gives the verification actions a real (if
 * simple) server-side ceiling.
 *
 * LIMITATION: state is per Node process. A multi-instance deployment should
 * move this to Redis/Upstash so the budget is shared. It is still a large
 * improvement over a client-side counter, which an attacker simply ignores.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const MAX_TRACKED_KEYS = 10_000;

const prune = (now: number) => {
  if (buckets.size < MAX_TRACKED_KEYS) return;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
};

/**
 * Counts one hit against `key`. Returns `allowed: false` once the budget for
 * the current window is exhausted.
 */
export const rateLimit = (
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number } => {
  const now = Date.now();

  if (buckets.size >= MAX_TRACKED_KEYS) prune(now);

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  bucket.count += 1;

  if (bucket.count > limit) return { allowed: false, remaining: 0 };

  return { allowed: true, remaining: limit - bucket.count };
};

/** Clears the budget for a key — call after a successful verification. */
export const resetRateLimit = (key: string) => {
  buckets.delete(key);
};
