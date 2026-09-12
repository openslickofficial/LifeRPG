// Life RPG: Core Progression Engine & Leveling Curve
// Implements non-linear leveling curve, multi-level jumps, and progress calculations.

/**
 * Computes the XP required to advance from `level` to `level + 1`.
 * Uses non-linear scaling curve: Math.round(50 * Math.pow(level, 1.5)).
 *
 * Examples:
 * - Level 1 -> 2: 50 XP
 * - Level 2 -> 3: 141 XP
 * - Level 3 -> 4: 260 XP
 * - Level 4 -> 5: 400 XP
 * - Level 5 -> 6: 559 XP
 */
export function xpRequiredForLevel(level: number): number {
  const normalizedLevel = Math.max(1, Math.floor(level));
  return Math.round(50 * Math.pow(normalizedLevel, 1.5));
}

export interface LevelProgress {
  xpIntoLevel: number;
  xpNeededForNextLevel: number;
  percentage: number;
}

/**
 * Calculates current XP progress towards the next level.
 * Used to drive animated SVG progress rings and stat meters.
 *
 * @param currentLevel Current character/attribute level
 * @param currentXp XP accumulated in the current tier
 */
export function getLevelProgress(
  currentLevel: number,
  currentXp: number
): LevelProgress {
  const level = Math.max(1, Math.floor(currentLevel));
  const xpNeeded = xpRequiredForLevel(level);
  const xpIntoLevel = Math.max(0, Math.min(xpNeeded, currentXp));
  const percentage = Math.min(
    100,
    Math.max(0, Math.round((xpIntoLevel / xpNeeded) * 100))
  );

  return {
    xpIntoLevel,
    xpNeededForNextLevel: xpNeeded,
    percentage,
  };
}

export interface LevelUpResult {
  newLevel: number;
  leveledUp: boolean;
  levelsGained: number;
  remainingXp: number;
}

/**
 * Checks if accumulated XP exceeds thresholds and calculates level progression.
 * Handles edge cases where a large XP grant triggers multiple level jumps at once.
 * Correctly rolls over remaining XP to the next tier without resetting to zero.
 *
 * @param currentLevel Current level before XP addition
 * @param totalXp Total XP available (current XP in tier + newly awarded XP)
 */
export function checkLevelUp(
  currentLevel: number,
  totalXp: number
): LevelUpResult {
  let level = Math.max(1, Math.floor(currentLevel));
  let xp = Math.max(0, totalXp);
  const initialLevel = level;

  while (xp >= xpRequiredForLevel(level)) {
    xp -= xpRequiredForLevel(level);
    level += 1;
  }

  const levelsGained = level - initialLevel;

  return {
    newLevel: level,
    leveledUp: levelsGained > 0,
    levelsGained,
    remainingXp: xp,
  };
}
