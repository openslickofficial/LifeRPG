// Life RPG: Server-Side Anti-Cheat Reward Engine
// Computes XP and currency rewards server-side to prevent client tampering.

import { TaskDifficulty } from "@/lib/validations/task";

export interface TaskReward {
  xp: number;
  currency: number;
}

const REWARD_TIERS: Record<TaskDifficulty, TaskReward> = {
  easy: {
    xp: 10,
    currency: 2,
  },
  medium: {
    xp: 25,
    currency: 5,
  },
  hard: {
    xp: 50,
    currency: 10,
  },
};

/**
 * Pure function to calculate rewards based on task category and difficulty tier.
 * Keeps reward calculations strictly server-side (anti-cheat rulebook requirement).
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

  // In future phases, category bonuses or active title multipliers can be applied here
  return {
    xp: baseReward.xp,
    currency: baseReward.currency,
  };
}

export function getRewardPreview(
  difficulty: TaskDifficulty = "medium"
): TaskReward {
  return REWARD_TIERS[difficulty] || REWARD_TIERS.medium;
}
