// Life RPG: Server-Side Anti-Cheat Reward Engine
// Computes XP and currency rewards server-side to prevent client tampering.
// Supports task timing validation, minimum age floors, diminishing returns on repeat tasks,
// daily difficulty caps, soft anomaly throttle, combo streak bonuses, variable variance, and critical hits.

import { TaskDifficulty } from "@/lib/validations/task";

export interface TaskReward {
  xp: number;
  currency: number;
}

export interface RewardPreviewInfo extends TaskReward {
  description: string;
  tag: string;
}

export const REWARD_TIERS: Record<TaskDifficulty, RewardPreviewInfo> = {
  easy: {
    xp: 10,
    currency: 2,
    tag: "Quick Win",
    description: "~10 XP, ~2 Gold · Quick habit check (no minimum time)",
  },
  medium: {
    xp: 25,
    currency: 5,
    tag: "Standard Quest",
    description: "~25 XP, ~5 Gold · Requires >= 5 min elapsed time (Cap: 10/day)",
  },
  hard: {
    xp: 50,
    currency: 10,
    tag: "Epic Sprint",
    description: "~50 XP, ~10 Gold · Requires focus sprint >= 20 min (Cap: 5/day)",
  },
};

/**
 * Pure function to calculate base rewards based on category and difficulty tier.
 */
export function calculateTaskReward(
  category: string,
  difficulty?: TaskDifficulty | string
): TaskReward {
  const normalizedDifficulty: TaskDifficulty =
    difficulty && difficulty in REWARD_TIERS
      ? (difficulty as TaskDifficulty)
      : "medium";

  const baseReward = REWARD_TIERS[normalizedDifficulty];

  return {
    xp: baseReward.xp,
    currency: baseReward.currency,
  };
}

/**
 * Checks if a task has satisfied the minimum creation age floor (30 seconds).
 * Prevents instant create-and-complete spam without punishing genuine quick tasks.
 */
export function checkMinimumTaskAge(
  createdAt: Date | string | number,
  completedAt: Date | string | number = Date.now()
): { allowed: boolean; message?: string; elapsedMs: number } {
  const createdMs = new Date(createdAt).getTime();
  const completedMs = new Date(completedAt).getTime();
  const elapsedMs = Math.max(0, completedMs - createdMs);

  // 30-second floor
  if (elapsedMs < 30 * 1000) {
    return {
      allowed: false,
      message: "Give it a bit more time before completing",
      elapsedMs,
    };
  }

  return {
    allowed: true,
    elapsedMs,
  };
}

export interface CalculateFinalRewardParams {
  declaredDifficulty?: TaskDifficulty | string;
  createdAt: Date | string | number;
  startedAt?: Date | string | number | null;
  completedAt?: Date | string | number;
  totalPausedSeconds?: number;
  todayHardCompletionsCount?: number;
  todayMediumCompletionsCount?: number;
  previousSameTitleCompletionsIn24h?: number;
  completionsInLast10Minutes?: number;
  lastCompletionAt?: Date | string | number | null;
  previousComboCount?: number;
  forceVariableMultiplier?: number;
  forceCritical?: boolean;
}

export interface FinalRewardBreakdown {
  base: {
    xp: number;
    currency: number;
    declaredDifficulty: TaskDifficulty;
    qualifyingDifficulty: TaskDifficulty;
  };
  appliedMultipliers: string[];
  multipliers: {
    timingDowngraded: boolean;
    dailyCapDowngraded: boolean;
    repeatDecayMultiplier: number;
    anomalyThrottleMultiplier: number;
    comboMultiplier: number;
    variableMultiplier: number;
    critMultiplier: number;
  };
  final: {
    xp: number;
    currency: number;
  };
  wasCritical: boolean;
  comboCount: number;
  // Fields for backwards-compatibility with TaskCompletionRewardMeta:
  xp: number;
  currency: number;
  baseXp: number;
  baseCurrency: number;
  variableMultiplier: number;
  comboMultiplier: number;
  focusDowngraded: boolean;
  qualifyingDifficulty: TaskDifficulty;
}

/**
 * Unified server-side calculation that applies all anti-cheat checks & multipliers in order:
 * 1. Base reward for actual-qualifying difficulty tier (enforcing >= 5m for medium, >= 20m for hard)
 *    computed as: (completed_at - started_at) - total_paused_seconds
 * 2. Daily difficulty cap downgrade (Hard > 5 -> medium, Medium > 10 -> easy)
 * 3. Repeat-task diminishing returns decay (1st: 100%, 2nd: 70%, 3rd: 40%, 4th+: 15% floor)
 * 4. Soft anomaly throttle (> 8 completions in 10 minutes -> 50% reward reduction)
 * 5. Combo multiplier (+5% per step up to +50% within 4 hours)
 * 6. Variable random roll (0.9 to 1.1)
 * 7. Critical hit chance (5% chance of 2.0x)
 */
export function calculateFinalReward(
  params: CalculateFinalRewardParams
): FinalRewardBreakdown {
  const declaredDifficulty: TaskDifficulty =
    params.declaredDifficulty && params.declaredDifficulty in REWARD_TIERS
      ? (params.declaredDifficulty as TaskDifficulty)
      : "medium";

  const completedMs = params.completedAt
    ? new Date(params.completedAt).getTime()
    : Date.now();
  const startedMs = params.startedAt
    ? new Date(params.startedAt).getTime()
    : new Date(params.createdAt).getTime();
  const netPausedMs = Math.max(0, (params.totalPausedSeconds || 0) * 1000);
  const elapsedMs = Math.max(0, completedMs - startedMs - netPausedMs);

  const appliedMultipliers: string[] = [];

  // 1. Task Timing: Enforce minimum elapsed time per declared difficulty
  // easy = no minimum, medium = >= 5 min (300s), hard = >= 20 min (1200s)
  const fiveMinMs = 5 * 60 * 1000;
  const twentyMinMs = 20 * 60 * 1000;

  let qualifyingDifficulty: TaskDifficulty = declaredDifficulty;
  let timingDowngraded = false;

  if (declaredDifficulty === "hard") {
    if (elapsedMs >= twentyMinMs) {
      qualifyingDifficulty = "hard";
    } else if (elapsedMs >= fiveMinMs) {
      qualifyingDifficulty = "medium";
      timingDowngraded = true;
    } else {
      qualifyingDifficulty = "easy";
      timingDowngraded = true;
    }
  } else if (declaredDifficulty === "medium") {
    if (elapsedMs >= fiveMinMs) {
      qualifyingDifficulty = "medium";
    } else {
      qualifyingDifficulty = "easy";
      timingDowngraded = true;
    }
  } else {
    qualifyingDifficulty = "easy";
  }

  if (timingDowngraded) {
    appliedMultipliers.push(
      `timing_downgrade:${declaredDifficulty}->${qualifyingDifficulty}`
    );
  }

  // 2. Daily Difficulty Caps: Hard capped at 5/day, Medium capped at 10/day
  let dailyCapDowngraded = false;
  if (
    qualifyingDifficulty === "hard" &&
    (params.todayHardCompletionsCount || 0) >= 5
  ) {
    qualifyingDifficulty = "medium";
    dailyCapDowngraded = true;
    appliedMultipliers.push("daily_cap:hard_limit(5)->medium");
  }

  if (
    qualifyingDifficulty === "medium" &&
    (params.todayMediumCompletionsCount || 0) >= 10
  ) {
    qualifyingDifficulty = "easy";
    dailyCapDowngraded = true;
    appliedMultipliers.push("daily_cap:medium_limit(10)->easy");
  }

  // Determine base reward from final qualifying tier
  const baseXp = REWARD_TIERS[qualifyingDifficulty].xp;
  const baseCurrency = REWARD_TIERS[qualifyingDifficulty].currency;

  // 3. Repeat-Task Diminishing Returns (same title + category within 24 hours)
  const repeatCount = params.previousSameTitleCompletionsIn24h || 0;
  let repeatDecayMultiplier = 1.0;
  if (repeatCount === 0) {
    repeatDecayMultiplier = 1.0;
  } else if (repeatCount === 1) {
    repeatDecayMultiplier = 0.7;
    appliedMultipliers.push("repeat_decay:0.70x");
  } else if (repeatCount === 2) {
    repeatDecayMultiplier = 0.4;
    appliedMultipliers.push("repeat_decay:0.40x");
  } else {
    repeatDecayMultiplier = 0.15; // 15% flat floor
    appliedMultipliers.push("repeat_decay:0.15x");
  }

  // 4. Soft Anomaly Throttle (> 8 completions in last 10 minutes -> 50% reduction)
  const recent10mCount = params.completionsInLast10Minutes || 0;
  let anomalyThrottleMultiplier = 1.0;
  if (recent10mCount > 8) {
    anomalyThrottleMultiplier = 0.5;
    appliedMultipliers.push("anomaly_throttle:0.50x");
  }

  // 5. Combo Multiplier (+5% per step, max +50% at combo 10 within 4 hours)
  let comboCount = 1;
  if (params.lastCompletionAt) {
    const lastTime = new Date(params.lastCompletionAt).getTime();
    const fourHoursMs = 4 * 60 * 60 * 1000;
    if (!isNaN(lastTime) && completedMs - lastTime <= fourHoursMs) {
      comboCount = Math.max(1, (params.previousComboCount || 0) + 1);
    }
  }

  const comboMultiplier = 1.0 + Math.min(0.5, (comboCount - 1) * 0.05);
  if (comboCount > 1) {
    appliedMultipliers.push(
      `combo:x${comboCount}(+${Math.round((comboMultiplier - 1) * 100)}%)`
    );
  }

  // 6. Variable Random Multiplier (0.9 to 1.1)
  const variableMultiplier =
    params.forceVariableMultiplier !== undefined
      ? params.forceVariableMultiplier
      : 0.9 + Math.random() * 0.2;
  appliedMultipliers.push(`variable:${variableMultiplier.toFixed(2)}x`);

  // 7. Critical Hit Roll (5% chance, 2.0x reward)
  const wasCritical =
    params.forceCritical !== undefined
      ? params.forceCritical
      : Math.random() < 0.05;
  const critMultiplier = wasCritical ? 2.0 : 1.0;
  if (wasCritical) {
    appliedMultipliers.push("critical_hit:2.00x");
  }

  // Final Product
  const totalMultiplier =
    repeatDecayMultiplier *
    anomalyThrottleMultiplier *
    comboMultiplier *
    variableMultiplier *
    critMultiplier;

  const finalXp = Math.max(1, Math.round(baseXp * totalMultiplier));
  const finalCurrency = Math.max(
    1,
    Math.round(baseCurrency * totalMultiplier)
  );

  return {
    base: {
      xp: baseXp,
      currency: baseCurrency,
      declaredDifficulty,
      qualifyingDifficulty,
    },
    appliedMultipliers,
    multipliers: {
      timingDowngraded,
      dailyCapDowngraded,
      repeatDecayMultiplier,
      anomalyThrottleMultiplier,
      comboMultiplier: Math.round(comboMultiplier * 100) / 100,
      variableMultiplier: Math.round(variableMultiplier * 100) / 100,
      critMultiplier,
    },
    final: {
      xp: finalXp,
      currency: finalCurrency,
    },
    wasCritical,
    comboCount,
    // Backwards compatibility mappings:
    xp: finalXp,
    currency: finalCurrency,
    baseXp,
    baseCurrency,
    variableMultiplier: Math.round(variableMultiplier * 100) / 100,
    comboMultiplier: Math.round(comboMultiplier * 100) / 100,
    focusDowngraded: timingDowngraded,
    qualifyingDifficulty,
  };
}

export interface CompletionCalculationOptions {
  lastCompletionAt?: Date | string | null;
  previousComboCount?: number;
  focusStartedAt?: Date | string | null;
  startedAt?: Date | string | null;
  createdAt?: Date | string | null;
  totalPausedSeconds?: number;
  forceCritical?: boolean;
  forceVariableMultiplier?: number;
  todayHardCompletionsCount?: number;
  todayMediumCompletionsCount?: number;
  previousSameTitleCompletionsIn24h?: number;
  completionsInLast10Minutes?: number;
}

export type TaskCompletionRewardMeta = FinalRewardBreakdown;

/**
 * Backwards compatible adapter calling calculateFinalReward.
 */
export function calculateCompletionReward(
  difficulty: TaskDifficulty | string = "medium",
  options: CompletionCalculationOptions = {}
): FinalRewardBreakdown {
  const now = Date.now();
  const createdAt = options.createdAt || options.startedAt || options.focusStartedAt || (now - 60000);
  const startedAt = options.startedAt || options.focusStartedAt || createdAt;

  return calculateFinalReward({
    declaredDifficulty: difficulty,
    createdAt,
    startedAt,
    completedAt: now,
    totalPausedSeconds: options.totalPausedSeconds,
    todayHardCompletionsCount: options.todayHardCompletionsCount,
    todayMediumCompletionsCount: options.todayMediumCompletionsCount,
    previousSameTitleCompletionsIn24h: options.previousSameTitleCompletionsIn24h,
    completionsInLast10Minutes: options.completionsInLast10Minutes,
    lastCompletionAt: options.lastCompletionAt,
    previousComboCount: options.previousComboCount,
    forceCritical: options.forceCritical,
    forceVariableMultiplier: options.forceVariableMultiplier,
  });
}

export function getRewardPreview(
  difficulty: TaskDifficulty = "medium"
): RewardPreviewInfo {
  return REWARD_TIERS[difficulty] || REWARD_TIERS.medium;
}
