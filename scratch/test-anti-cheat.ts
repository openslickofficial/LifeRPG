import {
  checkMinimumTaskAge,
  calculateFinalReward,
} from "../lib/rpg/rewards";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${msg}`);
  }
  console.log(`✓ ${msg}`);
}

console.log("\n==========================================");
console.log("LIFE RPG: ANTI-CHEAT ENGINE TEST SUITE");
console.log("==========================================\n");

// 1. MINIMUM TASK AGE FLOOR (30 Seconds)
console.log("--- Test 1: Minimum Task Age Floor (30s) ---");
const now = Date.now();
const ageCheckInstant = checkMinimumTaskAge(now - 10 * 1000, now);
assert(!ageCheckInstant.allowed, "10-second old task must be rejected");
assert(
  ageCheckInstant.message === "Give it a bit more time before completing",
  "Error message must be 'Give it a bit more time before completing'"
);

const ageCheckAllowed = checkMinimumTaskAge(now - 35 * 1000, now);
assert(ageCheckAllowed.allowed, "35-second old task must be allowed");

// 2. TASK TIMING DOWNGRADES
console.log("\n--- Test 2: Task Timing Downgrades ---");

// Declared Hard, only 40 seconds elapsed (< 5m) -> downgrades to Easy
const hardFast = calculateFinalReward({
  declaredDifficulty: "hard",
  createdAt: now - 40 * 1000,
  completedAt: now,
  forceVariableMultiplier: 1.0,
  forceCritical: false,
});
assert(
  hardFast.base.qualifyingDifficulty === "easy",
  "Hard task completed in 40s must qualify as Easy"
);
assert(hardFast.base.xp === 10, "Base XP must be 10 for Easy tier");
assert(
  hardFast.appliedMultipliers.includes("timing_downgrade:hard->easy"),
  "Applied multipliers must log timing_downgrade:hard->easy"
);

// Declared Hard, 8 minutes elapsed (>= 5m, < 20m) -> downgrades to Medium
const hardMediumTime = calculateFinalReward({
  declaredDifficulty: "hard",
  createdAt: now - 8 * 60 * 1000,
  completedAt: now,
  forceVariableMultiplier: 1.0,
  forceCritical: false,
});
assert(
  hardMediumTime.base.qualifyingDifficulty === "medium",
  "Hard task completed in 8m must qualify as Medium"
);
assert(hardMediumTime.base.xp === 25, "Base XP must be 25 for Medium tier");
assert(
  hardMediumTime.appliedMultipliers.includes("timing_downgrade:hard->medium"),
  "Applied multipliers must log timing_downgrade:hard->medium"
);

// Declared Hard, 25 minutes elapsed (>= 20m) -> qualifies for Hard
const hardFullTime = calculateFinalReward({
  declaredDifficulty: "hard",
  createdAt: now - 25 * 60 * 1000,
  startedAt: now - 25 * 60 * 1000,
  completedAt: now,
  forceVariableMultiplier: 1.0,
  forceCritical: false,
});
assert(
  hardFullTime.base.qualifyingDifficulty === "hard",
  "Hard task completed in 25m must qualify as Hard"
);
assert(hardFullTime.base.xp === 50, "Base XP must be 50 for Hard tier");

// Declared Medium, 2 minutes elapsed (< 5m) -> downgrades to Easy
const medFast = calculateFinalReward({
  declaredDifficulty: "medium",
  createdAt: now - 2 * 60 * 1000,
  completedAt: now,
  forceVariableMultiplier: 1.0,
  forceCritical: false,
});
assert(
  medFast.base.qualifyingDifficulty === "easy",
  "Medium task completed in 2m must qualify as Easy"
);
assert(
  medFast.appliedMultipliers.includes("timing_downgrade:medium->easy"),
  "Applied multipliers must log timing_downgrade:medium->easy"
);

// 3. DAILY DIFFICULTY CAPS
console.log("\n--- Test 3: Daily Difficulty Caps ---");
// Hard cap: 5 per day. If >= 5, downgrade to Medium.
const hardCapped = calculateFinalReward({
  declaredDifficulty: "hard",
  createdAt: now - 30 * 60 * 1000,
  completedAt: now,
  todayHardCompletionsCount: 5,
  forceVariableMultiplier: 1.0,
  forceCritical: false,
});
assert(
  hardCapped.base.qualifyingDifficulty === "medium",
  "Hard task when 5 already completed today must downgrade to Medium"
);
assert(
  hardCapped.appliedMultipliers.includes("daily_cap:hard_limit(5)->medium"),
  "Applied multipliers must log daily_cap:hard_limit(5)->medium"
);

// Medium cap: 10 per day. If >= 10, downgrade to Easy.
const medCapped = calculateFinalReward({
  declaredDifficulty: "medium",
  createdAt: now - 10 * 60 * 1000,
  completedAt: now,
  todayMediumCompletionsCount: 10,
  forceVariableMultiplier: 1.0,
  forceCritical: false,
});
assert(
  medCapped.base.qualifyingDifficulty === "easy",
  "Medium task when 10 already completed today must downgrade to Easy"
);
assert(
  medCapped.appliedMultipliers.includes("daily_cap:medium_limit(10)->easy"),
  "Applied multipliers must log daily_cap:medium_limit(10)->easy"
);

// 4. DIMINISHING RETURNS ON REPEATED TASKS
console.log("\n--- Test 4: Diminishing Returns on Repeated Tasks ---");
// 1st: 100%
const repeat1 = calculateFinalReward({
  declaredDifficulty: "easy",
  createdAt: now - 60 * 1000,
  previousSameTitleCompletionsIn24h: 0,
  forceVariableMultiplier: 1.0,
  forceCritical: false,
});
assert(repeat1.multipliers.repeatDecayMultiplier === 1.0, "1st completion = 1.0x (100%)");
assert(repeat1.final.xp === 10, "1st completion awards 10 XP");

// 2nd: 70%
const repeat2 = calculateFinalReward({
  declaredDifficulty: "easy",
  createdAt: now - 60 * 1000,
  previousSameTitleCompletionsIn24h: 1,
  forceVariableMultiplier: 1.0,
  forceCritical: false,
});
assert(repeat2.multipliers.repeatDecayMultiplier === 0.7, "2nd completion = 0.7x (70%)");
assert(repeat2.final.xp === 7, "2nd completion awards 7 XP (10 * 0.7)");

// 3rd: 40%
const repeat3 = calculateFinalReward({
  declaredDifficulty: "easy",
  createdAt: now - 60 * 1000,
  previousSameTitleCompletionsIn24h: 2,
  forceVariableMultiplier: 1.0,
  forceCritical: false,
});
assert(repeat3.multipliers.repeatDecayMultiplier === 0.4, "3rd completion = 0.4x (40%)");
assert(repeat3.final.xp === 4, "3rd completion awards 4 XP (10 * 0.4)");

// 4th+: 15% flat floor
const repeat4 = calculateFinalReward({
  declaredDifficulty: "easy",
  createdAt: now - 60 * 1000,
  previousSameTitleCompletionsIn24h: 3,
  forceVariableMultiplier: 1.0,
  forceCritical: false,
});
assert(repeat4.multipliers.repeatDecayMultiplier === 0.15, "4th+ completion = 0.15x (15% floor)");
assert(repeat4.final.xp === 2, "4th+ completion awards 2 XP (10 * 0.15 rounded)");

// 5. SOFT ANOMALY THROTTLE
console.log("\n--- Test 5: Soft Anomaly Throttle ---");
const normalRate = calculateFinalReward({
  declaredDifficulty: "easy",
  createdAt: now - 60 * 1000,
  completionsInLast10Minutes: 5,
  forceVariableMultiplier: 1.0,
  forceCritical: false,
});
assert(normalRate.multipliers.anomalyThrottleMultiplier === 1.0, "5 completions in 10m = 1.0x");

const throttledRate = calculateFinalReward({
  declaredDifficulty: "easy",
  createdAt: now - 60 * 1000,
  completionsInLast10Minutes: 9,
  forceVariableMultiplier: 1.0,
  forceCritical: false,
});
assert(
  throttledRate.multipliers.anomalyThrottleMultiplier === 0.5,
  "9 completions in 10m triggers 50% anomaly reduction"
);
assert(
  throttledRate.appliedMultipliers.includes("anomaly_throttle:0.50x"),
  "Applied multipliers must log anomaly_throttle:0.50x"
);

// 6. COMBO + CRITICAL HIT STACKING
console.log("\n--- Test 6: Combo + Critical Hit Stacking ---");
const fullStack = calculateFinalReward({
  declaredDifficulty: "hard",
  createdAt: now - 25 * 60 * 1000,
  lastCompletionAt: now - 30 * 60 * 1000, // 30m ago, within 4h
  previousComboCount: 5, // combo count becomes 6 -> +25%
  forceVariableMultiplier: 1.0,
  forceCritical: true, // 2.0x
});
assert(fullStack.comboCount === 6, "Combo count should be 6");
assert(fullStack.multipliers.comboMultiplier === 1.25, "Combo 6 should give 1.25x");
assert(fullStack.wasCritical === true, "Critical hit should be active");
// Base: 50 XP * 1.25 (combo) * 2.0 (crit) = 125 XP
assert(fullStack.final.xp === 125, `Expected 125 XP, got ${fullStack.final.xp}`);

console.log("\n==========================================");
console.log("ALL ANTI-CHEAT UNIT TESTS PASSED SUCCESSFULLY! 🎉");
console.log("==========================================\n");
