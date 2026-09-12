import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store for rate limiting by identifier (e.g. IP + endpoint)
const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

export interface RateLimitOptions {
  limit: number;       // Maximum requests allowed within window
  windowMs: number;    // Time window in milliseconds
  keyPrefix?: string;  // Prefix to distinguish endpoints
}

/**
 * Extracts the client IP from request headers (x-forwarded-for, x-real-ip)
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Checks if a request exceeds rate limits.
 * Returns { success: true } if allowed, or { success: false, retryAfterSeconds } if exceeded.
 */
export function checkRateLimit(
  req: NextRequest,
  options: RateLimitOptions,
  customIdentifier?: string
): { success: boolean; retryAfterSeconds?: number } {
  const ip = getClientIp(req);
  const identifier = customIdentifier || ip;
  const key = `${options.keyPrefix || "rl"}:${identifier}`;
  const now = Date.now();

  const record = rateLimitStore.get(key);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return { success: true };
  }

  if (record.count >= options.limit) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { success: false, retryAfterSeconds };
  }

  record.count += 1;
  return { success: true };
}
