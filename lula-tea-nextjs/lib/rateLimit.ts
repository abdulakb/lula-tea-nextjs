/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a database-backed solution
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // Time window in milliseconds
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Check if a request is rate limited
 * @param identifier - Unique identifier (e.g., IP address, email)
 * @param config - Rate limit configuration
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  }
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetTime < now) {
    // Create new entry
    const resetTime = now + config.windowMs;
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    });

    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime,
    };
  }

  // Increment existing entry
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: entry.count <= config.maxAttempts,
    remaining: Math.max(0, config.maxAttempts - entry.count),
    resetTime: entry.resetTime,
  };
}

/**
 * Reset rate limit for an identifier
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return "unknown";
}
