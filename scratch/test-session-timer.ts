import { calculateFinalReward } from "../lib/rpg/rewards";

/**
 * Unit Test Suite for Task Sessions, Pause Controls, Ceilings, and Net Duration Deductions
 */
function runTests() {
  console.log("=================================================================");
  console.log("🧪 RUNNING TASK SESSIONS, PAUSE & RESET UNIT TEST SUITE");
  console.log("=================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}${detail ? " - " + detail : ""}`);
      failed++;
    }
  }

  const now = Date.now();

  // TEST 1: Net Elapsed Duration Calculation (Paused seconds deduction)
  // User started 25 minutes ago, but paused for 6 minutes (360s). Net focused = 19 minutes (<20m hard threshold).
  // Declared Hard -> should downgrade to medium (since net focused is 19m < 20m).
  const started25mAgo = new Date(now - 25 * 60 * 1000).toISOString();
  const res1 = calculateFinalReward({
    declaredDifficulty: "hard",
    createdAt: started25mAgo,
    startedAt: started25mAgo,
    totalPausedSeconds: 6 * 60, // 6 minutes paused
    completedAt: new Date(now).toISOString(),
    todayHardCompletionsCount: 0,
    todayMediumCompletionsCount: 0,
    previousSameTitleCompletionsIn24h: 0,
    previousComboCount: 1,
  });

  assert(
    res1.qualifyingDifficulty === "medium",
    "Net duration with 6m paused on 25m total downgrades Hard to Medium",
    `Expected medium, got ${res1.qualifyingDifficulty}`
  );
  assert(
    res1.multipliers.timingDowngraded === true,
    "Timing downgraded flag is set when net elapsed falls below threshold"
  );

  // TEST 2: Hard Task with Sufficient Net Focus
  // User started 25 minutes ago, paused for 2 minutes (120s). Net focused = 23 minutes (>=20m hard threshold).
  // Should qualify for full Hard rewards.
  const res2 = calculateFinalReward({
    declaredDifficulty: "hard",
    createdAt: started25mAgo,
    startedAt: started25mAgo,
    totalPausedSeconds: 2 * 60, // 2 minutes paused -> 23m net
    completedAt: new Date(now).toISOString(),
    todayHardCompletionsCount: 0,
    todayMediumCompletionsCount: 0,
    previousSameTitleCompletionsIn24h: 0,
    previousComboCount: 1,
  });

  assert(
    res2.qualifyingDifficulty === "hard",
    "Net duration with 2m paused on 25m total qualifies for full Hard rewards",
    `Expected hard, got ${res2.qualifyingDifficulty}`
  );
  assert(
    res2.multipliers.timingDowngraded === false,
    "Timing downgraded flag is false when net duration meets requirement"
  );

  // TEST 3: Medium Task Net Duration Evaluation
  // User started 6 minutes ago, paused for 2 minutes. Net focused = 4 minutes (<5m medium threshold).
  // Declared Medium -> should downgrade to easy.
  const started6mAgo = new Date(now - 6 * 60 * 1000).toISOString();
  const res3 = calculateFinalReward({
    declaredDifficulty: "medium",
    createdAt: started6mAgo,
    startedAt: started6mAgo,
    totalPausedSeconds: 2 * 60, // 2 minutes paused -> 4m net
    completedAt: new Date(now).toISOString(),
    todayHardCompletionsCount: 0,
    todayMediumCompletionsCount: 0,
    previousSameTitleCompletionsIn24h: 0,
    previousComboCount: 1,
  });

  assert(
    res3.qualifyingDifficulty === "easy",
    "Net duration with 2m paused on 6m total downgrades Medium to Easy",
    `Expected easy, got ${res3.qualifyingDifficulty}`
  );

  // TEST 4: Pause Count Limit Logic (Max 2 pauses allowed)
  function simulatePause(session: { pause_count: number; paused_at: string | null }) {
    if (session.pause_count >= 2) {
      return { success: false, error: "You've used your pauses for this session (maximum 2 pauses per quest)." };
    }
    return { success: true, pause_count: session.pause_count + 1, paused_at: new Date().toISOString() };
  }

  const session = { pause_count: 0, paused_at: null as string | null };
  const p1 = simulatePause(session);
  assert(p1.success === true && p1.pause_count === 1, "First pause succeeds (pause_count = 1)");
  session.pause_count = p1.pause_count!;

  const p2 = simulatePause(session);
  assert(p2.success === true && p2.pause_count === 2, "Second pause succeeds (pause_count = 2)");
  session.pause_count = p2.pause_count!;

  const p3 = simulatePause(session);
  assert(p3.success === false, "Third pause is strictly rejected (exceeds limit 2)");

  // TEST 5: Cumulative Pause Ceiling (Max 300s = 5m)
  function simulateResume(session: { started_at: number; paused_at: number; total_paused_seconds: number }) {
    const pauseElapsed = Math.floor((now - session.paused_at) / 1000);
    const newTotalPaused = session.total_paused_seconds + pauseElapsed;
    const sessionElapsed = Math.floor((now - session.started_at) / 1000);

    if (sessionElapsed > 7200) {
      return { success: false, autoCancelled: true, reason: "Session exceeded 2-hour maximum ceiling." };
    }
    if (newTotalPaused > 300) {
      return { success: false, autoCancelled: true, reason: "Session exceeded 5-minute maximum pause limit." };
    }
    return { success: true, autoCancelled: false, total_paused_seconds: newTotalPaused };
  }

  // Under limit (e.g. 2 minutes paused total)
  const resumeOk = simulateResume({
    started_at: now - 15 * 60 * 1000,
    paused_at: now - 2 * 60 * 1000,
    total_paused_seconds: 0,
  });
  assert(resumeOk.success === true && resumeOk.total_paused_seconds === 120, "Resume under 5m pause limit succeeds");

  // Exceeding cumulative limit (e.g. 350s paused)
  const resumeExceeded = simulateResume({
    started_at: now - 30 * 60 * 1000,
    paused_at: now - 6 * 60 * 1000, // 360s in this pause alone
    total_paused_seconds: 0,
  });
  assert(
    resumeExceeded.success === false && resumeExceeded.autoCancelled === true,
    "Resume exceeding 5-minute cumulative pause limit triggers auto-cancellation"
  );

  // TEST 6: Hard 2-Hour Session Ceiling
  const resumeExpired = simulateResume({
    started_at: now - 7500 * 1000, // > 2 hours ago
    paused_at: now - 30 * 1000,
    total_paused_seconds: 0,
  });
  assert(
    resumeExpired.success === false && resumeExpired.autoCancelled === true,
    "Session exceeding 2-hour hard ceiling triggers auto-cancellation"
  );

  // TEST 7: Undo Start Grace Window vs Restart
  function evaluateResetAction(session: { started_at: number; pause_count: number }) {
    const elapsedSec = (now - session.started_at) / 1000;
    if (elapsedSec <= 10 && session.pause_count === 0) {
      return { action: "undo", allowed: true };
    }
    return { action: "restart", allowed: true, reason: elapsedSec > 10 ? "window_expired" : "pause_used" };
  }

  // Within 5 seconds & 0 pauses
  const undoValid = evaluateResetAction({ started_at: now - 5000, pause_count: 0 });
  assert(undoValid.action === "undo", "Undo Start is active when <= 10s and pause_count === 0");

  // Past 10 seconds (15 seconds)
  const restartPastWindow = evaluateResetAction({ started_at: now - 15000, pause_count: 0 });
  assert(
    restartPastWindow.action === "restart" && restartPastWindow.reason === "window_expired",
    "Switches to Restart after 10-second grace window expires"
  );

  // Within 5 seconds BUT already paused
  const restartPaused = evaluateResetAction({ started_at: now - 5000, pause_count: 1 });
  assert(
    restartPaused.action === "restart" && restartPaused.reason === "pause_used",
    "Switches to Restart if any pauses were used even within 10s"
  );

  console.log("\n=================================================================");
  console.log(`📊 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
