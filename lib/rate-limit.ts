// Life RPG: Reusable In-Memory Sliding Window Rate Limiter
// Enforces limits per user to prevent quest spam and rapid-fire exploits.

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
    windowMs: 60 * 1000, // 1 minute
    errorMessage:
      "Too many quests forged in a short time (max 20/min). Pace your ambition, adventurer!",
  },
  complete_task: {
    limit: 30,
    windowMs: 60 * 1000, // 1 minute
    errorMessage:
      "Quest completion rate limit reached (max 30/min). Take a breath, hero!",
  },
};

// In-memory sliding window timestamp store keyed by `${identifier}:${action}`
const rateLimitStore = new Map<string, number[]>();

// Prune old timestamps periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of rateLimitStore.entries()) {
      const validTimestamps = timestamps.filter((t) => now - t < 120 * 1000);
      if (validTimestamps.length === 0) {
        rateLimitStore.delete(key);
      } else {
        rateLimitStore.set(key, validTimestamps);
      }
    }
  }, 180 * 1000);
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
  const config = ACTION_CONFIGS[action] || {
    limit: 30,
    windowMs: 60 * 1000,
    errorMessage:
      "Rate limit exceeded. Please wait a moment before trying again.",
  };

  const key = `${identifier}:${action}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const currentTimestamps = (rateLimitStore.get(key) || []).filter(
    (timestamp) => timestamp > windowStart
  );

  if (currentTimestamps.length >= config.limit) {
    const oldestTimestamp = currentTimestamps[0];
    const resetSeconds = Math.max(
      1,
      Math.ceil((oldestTimestamp + config.windowMs - now) / 1000)
    );

    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: resetSeconds,
      error: config.errorMessage,
    };
  }

  currentTimestamps.push(now);
  rateLimitStore.set(key, currentTimestamps);

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - currentTimestamps.length,
    reset: Math.ceil(config.windowMs / 1000),
  };
}
