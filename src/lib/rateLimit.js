// Lightweight in-memory rate limiter.
//
// This app runs as a single `next start` process (see README — it's a
// small-business back office, not a multi-instance deployment), so an
// in-process Map is fine. If this ever moves behind a load balancer with
// more than one instance, each instance would keep its own counts and the
// limits below would effectively multiply — swap the Map for Redis (or
// similar shared store) at that point.
//
// Fixed-window counter: each key gets a count that resets every WINDOW_MS.
// Stale windows are swept periodically so a long-running process doesn't
// leak memory from one-off/abandoned IPs.

const WINDOW_MS = 60 * 1000; // 1 minute windows

const buckets = new Map(); // key -> { count, windowStart }
let lastSweep = 0;

function sweep(now) {
  for (const [key, entry] of buckets) {
    if (now - entry.windowStart > WINDOW_MS * 5) buckets.delete(key);
  }
}

/**
 * @param {string} key - unique identifier, e.g. `${ip}:login`
 * @param {number} limit - max requests allowed per window
 * @returns {{ allowed: boolean, remaining: number, retryAfterMs: number }}
 */
export function checkRateLimit(key, limit) {
  const now = Date.now();
  if (now - lastSweep > WINDOW_MS) {
    sweep(now);
    lastSweep = now;
  }

  let entry = buckets.get(key);
  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    entry = { count: 0, windowStart: now };
    buckets.set(key, entry);
  }

  entry.count++;
  const allowed = entry.count <= limit;
  const retryAfterMs = allowed ? 0 : entry.windowStart + WINDOW_MS - now;
  return { allowed, remaining: Math.max(0, limit - entry.count), retryAfterMs };
}

// Best-effort client IP. Behind a reverse proxy (nginx, Cloudflare, a PaaS
// load balancer) the real client IP arrives in a forwarded header — trust
// only what your actual proxy sets. Falls back to 'unknown' when running
// unproxied (e.g. `next dev`), which means all such requests share one
// bucket; that's fine for local dev and still fails safe (it just rate
// limits "everyone behind this address" together rather than not at all).
export function getClientIp(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}
