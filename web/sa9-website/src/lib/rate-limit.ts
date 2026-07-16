// Simple in-memory token-bucket rate limiter.
//
// NOTE: state is per-process, so under a multi-replica GKE deployment each
// replica enforces its own limit independently. This is acceptable as a
// basic abuse brake for low-volume public endpoints; a shared Redis-backed
// limiter is deferred infra work. Do not rely on this for hard quotas.

interface Bucket {
  tokens: number;
  updatedAt: number;
}

export interface RateLimitOptions {
  /** Maximum number of requests allowed within the window. */
  limit: number;
  /** Sliding refill window, in milliseconds. */
  windowMs: number;
}

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

/**
 * Returns true if the request identified by `key` is allowed, false if it has
 * exceeded its bucket. Buckets refill linearly over `windowMs`.
 */
export function rateLimit(key: string, opts: RateLimitOptions): boolean {
  const now = Date.now();
  const refillPerMs = opts.limit / opts.windowMs;

  // Opportunistically evict stale buckets so the map can't grow unbounded.
  if (now - lastSweep > opts.windowMs) {
    for (const [k, b] of buckets) {
      if (now - b.updatedAt > opts.windowMs * 2) buckets.delete(k);
    }
    lastSweep = now;
  }

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: opts.limit, updatedAt: now };
    buckets.set(key, bucket);
  } else {
    const elapsed = now - bucket.updatedAt;
    bucket.tokens = Math.min(opts.limit, bucket.tokens + elapsed * refillPerMs);
    bucket.updatedAt = now;
  }

  if (bucket.tokens < 1) return false;
  bucket.tokens -= 1;
  return true;
}

/** Best-effort client IP from proxy headers, falling back to a constant. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
