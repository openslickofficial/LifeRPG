// Revel: Redis-backed sliding-window rate limiter.
// This intentionally keeps the exact existing action limits and user-scoping
// contracts while swapping the storage layer from a local in-memory Map to
// Upstash Redis for production safety across serverless instances.

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // seconds until reset
  error?: string;
}

interface RateLimitConfig {
  limit: number;
  windowMs: number;
  errorMessage: string;
}

const ACTION_CONFIGS: Record<string, RateLimitConfig> = {
  create_task: {
    limit: 20,
    windowMs: 60 * 1000,
    errorMessage:
      "Too many quests forged in a short time (max 20/min). Pace your ambition, adventurer!",
  },
  complete_task: {
    limit: 30,
    windowMs: 60 * 1000,
    errorMessage:
      "Quest completion rate limit reached (max 30/min). Take a breath, hero!",
  },
  purchase_item: {
    limit: 10,
    windowMs: 60 * 1000,
    errorMessage:
      "Vault rate limit reached. Please wait a moment before purchasing more items.",
  },
  update_task: {
    limit: 30,
    windowMs: 60 * 1000,
    errorMessage:
      "Quest update rate limit reached (max 30/min). Take a breath, hero!",
  },
  delete_task: {
    limit: 30,
    windowMs: 60 * 1000,
    errorMessage:
      "Quest removal rate limit reached (max 30/min). Take a breath, hero!",
  },
};

const DEFAULT_CONFIG: RateLimitConfig = {
  limit: 30,
  windowMs: 60 * 1000,
  errorMessage: "Rate limit exceeded. Please wait a moment before trying again.",
};

const rateLimiters = new Map<string, Ratelimit>();

function getRateLimiter(action: string): Ratelimit | null {
  const config = ACTION_CONFIGS[action] ?? DEFAULT_CONFIG;

  if (rateLimiters.has(action)) {
    return rateLimiters.get(action) ?? null;
  }

  try {
    const redis = Redis.fromEnv();
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.limit, `${Math.max(1, Math.round(config.windowMs / 1000))} s`),
      prefix: `revel:${action}`,
    });
    rateLimiters.set(action, limiter);
    return limiter;
  } catch (error) {
    // Fail-open: if Redis is misconfigured or unavailable in a serverless runtime,
    // we keep the action working rather than blocking all users.
    console.warn(`Rate limiter unavailable for ${action}:`, error);
    return null;
  }
}

/**
 * Checks rate limits for a given user identifier and action.
 * @param identifier User ID or client IP
 * @param action Action name ('create_task', 'complete_task', etc.)
 */
export async function rateLimit(
  identifier: string,
  action: string
): Promise<RateLimitResult> {
  const config = ACTION_CONFIGS[action] ?? DEFAULT_CONFIG;
  const limiter = getRateLimiter(action);

  if (!limiter) {
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit,
      reset: Math.ceil(config.windowMs / 1000),
    };
  }

  try {
    const result = await limiter.limit(identifier);
    const resetSeconds = Math.max(
      1,
      Math.ceil((Math.max(result.reset, Date.now() + 1000) - Date.now()) / 1000)
    );

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: resetSeconds,
      error: result.success ? undefined : config.errorMessage,
    };
  } catch (error) {
    console.warn(`Redis-backed rate limit check failed for ${action}:`, error);
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit,
      reset: Math.ceil(config.windowMs / 1000),
    };
  }
}
