/**
 * Simple in-memory rate limiter for Next.js API routes.
 *
 * Works per-serverless-instance (Vercel spins up multiple instances,
 * so this is "good enough" for brute-force protection — it limits
 * attacks from any single IP on a given instance). For production-grade
 * global rate limiting, use an edge KV store (Upstash Redis).
 */

interface Entry {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

const store = new Map<string, Entry>();

// Periodically purge old entries to prevent memory leaks (every 5 min)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      // Remove entries older than 30 minutes
      if (now - entry.firstAttempt > 30 * 60 * 1000) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  /** Maximum number of requests in the window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
  /** How long to block after exceeding limit (ms) */
  blockDurationMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Remaining requests in this window */
  remaining: number;
  /** Seconds until the block is lifted (only if !allowed) */
  retryAfterSeconds?: number;
}

/**
 * Check rate limit for a given key (e.g. IP address).
 * Returns { allowed: true } if the request is within limit.
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const existing = store.get(key);

  // Currently blocked
  if (existing?.blockedUntil && now < existing.blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.blockedUntil - now) / 1000),
    };
  }

  // Start fresh window or reset expired window
  if (!existing || now - existing.firstAttempt > config.windowMs) {
    store.set(key, { count: 1, firstAttempt: now });
    return { allowed: true, remaining: config.maxRequests - 1 };
  }

  // Increment within window
  existing.count++;

  if (existing.count > config.maxRequests) {
    existing.blockedUntil = now + config.blockDurationMs;
    store.set(key, existing);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(config.blockDurationMs / 1000),
    };
  }

  store.set(key, existing);
  return { allowed: true, remaining: config.maxRequests - existing.count };
}

/** Preset: Login — max 5 attempts per 15 minutes, block for 15 minutes */
export const LOGIN_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
  blockDurationMs: 15 * 60 * 1000,
};

/** Preset: Like endpoint — max 3 per hour per IP+destination */
export const LIKE_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 3,
  windowMs: 60 * 60 * 1000,
  blockDurationMs: 60 * 60 * 1000,
};
