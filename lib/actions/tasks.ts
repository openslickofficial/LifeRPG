
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createTaskSchema,
  updateTaskSchema,
  CreateTaskInput,
  UpdateTaskInput,
} from "@/lib/validations/task";
import {
  calculateTaskReward,
  calculateFinalReward,
  checkMinimumTaskAge,
} from "@/lib/rpg/rewards";
import {
  checkLevelUp,
  xpRequiredForLevel,
  getRankTitle,
} from "@/lib/rpg/leveling";
import { rateLimit } from "@/lib/rate-limit";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  isRateLimited?: boolean;
}

export interface LootDroppedItem {
  id: string;
  name: string;
  type: string;
  rarity: string;
}

export interface TaskCompletionResult {
  task_id?: string;
  daily_quest_id?: string;
  base?: {
    xp: number;
    currency: number;
    declaredDifficulty: string;
    qualifyingDifficulty: string;
  };
  appliedMultipliers?: string[];
  final?: {
    xp: number;
    currency: number;
  };
  xpAwarded: number;
  currencyAwarded: number;
  wasCritical: boolean;
  comboCount: number;
  comboMultiplier: number;
  lootDropped: LootDroppedItem | null;
  leveledUp: boolean;
  newRankTitle: string;
  streakShieldConsumed: boolean;
  streakShields?: number;
  focusDowngraded?: boolean;
  new_xp?: number;
  new_currency?: number;
  new_level?: number;
  new_streak?: number;
  longest_streak?: number;
  category?: string;
  characterLevelUp?: {
    leveledUp: boolean;
    oldLevel: number;
    newLevel: number;
    levelsGained: number;
    remainingXp: number;
    xpNeeded: number;
  };
  attributeLevelUp?: {
    leveledUp: boolean;
    attributeName: string;
    oldLevel: number;
    newLevel: number;
    levelsGained: number;
    remainingXp: number;
    xpNeeded: number;
  };
}

export interface DailyQuestItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  xp_reward: number;
  currency_reward: number;
  active_date: string;
  isCompleted: boolean;
}

export interface TaskSessionData {
  id: string;
  task_id: string;
  profile_id: string;
  status: "running" | "completed" | "cancelled";
  started_at: string;
  ended_at: string | null;
  paused_at: string | null;
  total_paused_seconds: number;
  pause_count: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Creates a new task for the authenticated character.
 * Enforces Zod validation, rate limiting (20/min), and calculates rewards server-side.
 */
export async function createTaskAction(
  input: CreateTaskInput
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "You must be authenticated to forge quests.",
      };
    }

    // 1. Enforce rate limiting: 20 creations per minute
    const rl = await rateLimit(user.id, "create_task");
    if (!rl.success) {
      return {
        success: false,
        error: rl.error,
        isRateLimited: true,
      };
    }

    // 2. Validate input with Zod
    const validation = createTaskSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]?.message || "Invalid quest parameters.",
      };
    }

    const {
      title,
      description,
      category,
      difficulty,
      due_date,
      focus_started_at,
      started_at,
    } = validation.data;

    // 3. Server-side reward calculation (Anti-cheat: clients cannot dictate XP/currency)
    const { xp, currency } = calculateTaskReward(category, difficulty);

    // 4. Insert into database
    const { data: task, error: insertError } = await supabase
      .from("tasks")
      .insert({
        profile_id: user.id,
        title,
        description: description || null,
        category,
        difficulty: difficulty || "medium",
        xp_reward: xp,
        currency_reward: currency,
        status: "pending",
        due_date: due_date && due_date.trim() !== "" ? due_date : null,
        focus_started_at: focus_started_at || started_at || null,
        started_at: started_at || focus_started_at || null,
      })
      .select()
      .single();

    if (insertError) {
      return {
        success: false,
        error: insertError.message,
      };
    }

    revalidatePath("/dashboard/quests");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: task,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to forge quest.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
/**
 * Helper to check whether an active session has exceeded hard ceilings:
 * 1) 2-hour hard session ceiling (7200 seconds)
 * 2) 5-minute cumulative pause ceiling (300 seconds)
 * If exceeded, automatically marks the session as cancelled.
 */
async function checkAndAutoCancelSession(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  session: TaskSessionData
): Promise<{ expired: boolean; reason?: string }> {
  const nowMs = Date.now();
  const startedMs = new Date(session.started_at).getTime();
  const sessionElapsedSec = Math.floor((nowMs - startedMs) / 1000);

  // 1. Hard 2-hour session ceiling
  if (sessionElapsedSec > 7200) {
    await supabase
      .from("task_sessions")
      .update({
        status: "cancelled",
        ended_at: new Date(nowMs).toISOString(),
      })
      .eq("id", session.id);
    return {
      expired: true,
      reason: "Session exceeded 2-hour maximum ceiling and has expired.",
    };
  }

  // 2. Cumulative pause ceiling (300s = 5 minutes)
  let cumulativePaused = session.total_paused_seconds;
  if (session.paused_at) {
    const pauseElapsed = Math.floor(
      (nowMs - new Date(session.paused_at).getTime()) / 1000
    );
    cumulativePaused += Math.max(0, pauseElapsed);
  }

  if (cumulativePaused > 300) {
    await supabase
      .from("task_sessions")
      .update({
        status: "cancelled",
        ended_at: new Date(nowMs).toISOString(),
        total_paused_seconds: cumulativePaused,
      })
      .eq("id", session.id);
    return {
      expired: true,
      reason:
        "Session exceeded 5-minute maximum pause limit and has been cancelled.",
    };
  }

  return { expired: false };
}

/**
 * Starts a focus session for a quest, enforcing single-session exclusivity.
 */
export async function startTaskFocusAction(
  taskId: string
): Promise<ActionResult<TaskSessionData>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Authentication required.",
      };
    }

    // Exclusivity Check: Check if user already has an active running session
    const { data: activeSessions } = await supabase
      .from("task_sessions")
      .select("*")
      .eq("profile_id", user.id)
      .eq("status", "running");

    if (activeSessions && activeSessions.length > 0) {
      for (const sess of activeSessions) {
        const check = await checkAndAutoCancelSession(supabase, sess);
        if (!check.expired) {
          if (sess.task_id === taskId) {
            // Already running for this exact task
            return {
              success: true,
              data: sess,
            };
          } else {
            return {
              success: false,
              error:
                "You already have an active focus session on another quest. Complete or cancel it first.",
            };
          }
        }
      }
    }

    const nowIso = new Date().toISOString();

    // Create new session in task_sessions table
    const { data: newSession, error: sessionError } = await supabase
      .from("task_sessions")
      .insert({
        task_id: taskId,
        profile_id: user.id,
        status: "running",
        started_at: nowIso,
        total_paused_seconds: 0,
        pause_count: 0,
      })
      .select()
      .single();

    if (sessionError) {
      return {
        success: false,
        error: sessionError.message,
      };
    }

    // Also update task record for backwards compatibility
    await supabase
      .from("tasks")
      .update({
        focus_started_at: nowIso,
        started_at: nowIso,
      })
      .eq("id", taskId)
      .eq("profile_id", user.id);

    revalidatePath("/dashboard/quests");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: newSession,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to start focus session.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Pauses an active focus session.
 * Enforces:
 * - Only valid when session status = 'running'
 * - Max 2 pauses per session (rejects 3rd attempt)
 * - 2-hour hard session ceiling
 * - 5-minute cumulative pause cap
 * Exclusivity lock remains active while paused.
 */
export async function pauseSessionAction(
  sessionId: string
): Promise<ActionResult<TaskSessionData>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Authentication required.",
      };
    }

    const { data: session, error: fetchErr } = await supabase
      .from("task_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("profile_id", user.id)
      .single();

    if (fetchErr || !session) {
      return {
        success: false,
        error: "Focus session not found.",
      };
    }

    if (session.status !== "running") {
      return {
        success: false,
        error: "Cannot pause a session that is not currently running.",
      };
    }

    // Already paused
    if (session.paused_at) {
      return {
        success: true,
        data: session,
      };
    }

    // Check ceilings before allowing pause
    const check = await checkAndAutoCancelSession(supabase, session);
    if (check.expired) {
      revalidatePath("/dashboard/quests");
      return {
        success: false,
        error: check.reason || "Session has expired and cannot be paused.",
      };
    }

    // Enforce max 2 pauses limit
    if (session.pause_count >= 2) {
      return {
        success: false,
        error:
          "You've used your pauses for this session (maximum 2 pauses per quest).",
      };
    }

    const nowIso = new Date().toISOString();
    const newPauseCount = session.pause_count + 1;

    const { data: updatedSession, error: updateErr } = await supabase
      .from("task_sessions")
      .update({
        paused_at: nowIso,
        pause_count: newPauseCount,
      })
      .eq("id", sessionId)
      .eq("profile_id", user.id)
      .select()
      .single();

    if (updateErr) {
      return {
        success: false,
        error: updateErr.message,
      };
    }

    revalidatePath("/dashboard/quests");
    return {
      success: true,
      data: updatedSession,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to pause focus session.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Resumes a paused focus session.
 * Enforces:
 * - Session must be running and currently paused (paused_at != null)
 * - Computes elapsed paused time and adds to total_paused_seconds
 * - Rejects (auto-cancels) if now - started_at > 2 hours
 * - Rejects (auto-cancels) if total_paused_seconds > 300 seconds (5 minutes)
 */
export async function resumeSessionAction(
  sessionId: string
): Promise<ActionResult<TaskSessionData>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Authentication required.",
      };
    }

    const { data: session, error: fetchErr } = await supabase
      .from("task_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("profile_id", user.id)
      .single();

    if (fetchErr || !session) {
      return {
        success: false,
        error: "Focus session not found.",
      };
    }

    if (session.status !== "running") {
      return {
        success: false,
        error: "Session is not running.",
      };
    }

    if (!session.paused_at) {
      return {
        success: true,
        data: session, // already running
      };
    }

    const nowMs = Date.now();
    const startedMs = new Date(session.started_at).getTime();
    const pausedMs = new Date(session.paused_at).getTime();
    const pauseElapsedSec = Math.max(0, Math.floor((nowMs - pausedMs) / 1000));
    const newTotalPaused = session.total_paused_seconds + pauseElapsedSec;

    // Ceiling check: 2-hour hard session ceiling
    if (Math.floor((nowMs - startedMs) / 1000) > 7200) {
      await supabase
        .from("task_sessions")
        .update({
          status: "cancelled",
          ended_at: new Date(nowMs).toISOString(),
          paused_at: null,
          total_paused_seconds: newTotalPaused,
        })
        .eq("id", sessionId);

      revalidatePath("/dashboard/quests");
      return {
        success: false,
        error: "Session expired (exceeded 2-hour maximum ceiling).",
      };
    }

    // Cumulative pause limit: 5 minutes (300 seconds)
    if (newTotalPaused > 300) {
      await supabase
        .from("task_sessions")
        .update({
          status: "cancelled",
          ended_at: new Date(nowMs).toISOString(),
          paused_at: null,
          total_paused_seconds: newTotalPaused,
        })
        .eq("id", sessionId);

      revalidatePath("/dashboard/quests");
      return {
        success: false,
        error:
          "Session exceeded 5-minute maximum pause limit and has been cancelled.",
      };
    }

    // Valid resume: clear paused_at, accumulate total_paused_seconds
    const { data: updatedSession, error: updateErr } = await supabase
      .from("task_sessions")
      .update({
        paused_at: null,
        total_paused_seconds: newTotalPaused,
      })
      .eq("id", sessionId)
      .eq("profile_id", user.id)
      .select()
      .single();

    if (updateErr) {
      return {
        success: false,
        error: updateErr.message,
      };
    }

    revalidatePath("/dashboard/quests");
    return {
      success: true,
      data: updatedSession,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to resume focus session.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Undo Start: Allowed ONLY within 10 seconds of started_at with zero pauses used.
 * Completely deletes the session row with zero consequence.
 */
export async function undoStartSessionAction(
  sessionId: string
): Promise<ActionResult<{ undone: boolean }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Authentication required.",
      };
    }

    const { data: session, error: fetchErr } = await supabase
      .from("task_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("profile_id", user.id)
      .single();

    if (fetchErr || !session) {
      return {
        success: false,
        error: "Focus session not found.",
      };
    }

    if (session.status !== "running") {
      return {
        success: false,
        error: "Can only undo an active running session.",
      };
    }

    if (session.pause_count > 0) {
      return {
        success: false,
        error:
          "Undo is only available before any pauses have been used. Use Restart instead.",
      };
    }

    const nowMs = Date.now();
    const startedMs = new Date(session.started_at).getTime();
    const elapsedSec = (nowMs - startedMs) / 1000;

    if (elapsedSec > 10) {
      return {
        success: false,
        error:
          "Undo window expired (available only within first 10 seconds). Use Restart instead.",
      };
    }

    // Fully delete session row
    const { error: deleteErr } = await supabase
      .from("task_sessions")
      .delete()
      .eq("id", sessionId)
      .eq("profile_id", user.id);

    if (deleteErr) {
      return {
        success: false,
        error: deleteErr.message,
      };
    }

    // Reset task started timestamps
    await supabase
      .from("tasks")
      .update({
        focus_started_at: null,
        started_at: null,
      })
      .eq("id", session.task_id)
      .eq("profile_id", user.id);

    revalidatePath("/dashboard/quests");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: { undone: true },
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to undo session start.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Restart: Cancels the current session and immediately starts a new one with a fresh started_at.
 * Never zeroes elapsed time in-place; marks previous session as cancelled.
 */
export async function restartSessionAction(
  sessionId: string
): Promise<ActionResult<TaskSessionData>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Authentication required.",
      };
    }

    const { data: session, error: fetchErr } = await supabase
      .from("task_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("profile_id", user.id)
      .single();

    if (fetchErr || !session) {
      return {
        success: false,
        error: "Focus session not found.",
      };
    }

    const nowIso = new Date().toISOString();

    // 1. Mark existing session as cancelled, releasing exclusivity lock
    await supabase
      .from("task_sessions")
      .update({
        status: "cancelled",
        ended_at: nowIso,
        paused_at: null,
      })
      .eq("id", sessionId)
      .eq("profile_id", user.id);

    // 2. Insert brand-new session with fresh started_at
    const { data: newSession, error: createErr } = await supabase
      .from("task_sessions")
      .insert({
        task_id: session.task_id,
        profile_id: user.id,
        status: "running",
        started_at: nowIso,
        total_paused_seconds: 0,
        pause_count: 0,
      })
      .select()
      .single();

    if (createErr) {
      return {
        success: false,
        error: createErr.message,
      };
    }

    // 3. Update task timestamps
    await supabase
      .from("tasks")
      .update({
        focus_started_at: nowIso,
        started_at: nowIso,
      })
      .eq("id", session.task_id)
      .eq("profile_id", user.id);

    revalidatePath("/dashboard/quests");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: newSession,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to restart session.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Cancels an active focus session.
 */
export async function cancelSessionAction(
  sessionId: string
): Promise<ActionResult<{ cancelled: boolean }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Authentication required.",
      };
    }

    const { data: session } = await supabase
      .from("task_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("profile_id", user.id)
      .single();

    if (!session) {
      return {
        success: false,
        error: "Focus session not found.",
      };
    }

    const nowIso = new Date().toISOString();
    await supabase
      .from("task_sessions")
      .update({
        status: "cancelled",
        ended_at: nowIso,
        paused_at: null,
      })
      .eq("id", sessionId)
      .eq("profile_id", user.id);

    await supabase
      .from("tasks")
      .update({
        focus_started_at: null,
        started_at: null,
      })
      .eq("id", session.task_id)
      .eq("profile_id", user.id);

    revalidatePath("/dashboard/quests");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: { cancelled: true },
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to cancel focus session.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Returns the active session for the authenticated user, checking ceilings.
 * If taskId is provided, returns the active session if it matches taskId.
 */
export async function getActiveSessionAction(
  taskId?: string
): Promise<ActionResult<TaskSessionData | null>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Authentication required.",
      };
    }

    let query = supabase
      .from("task_sessions")
      .select("*")
      .eq("profile_id", user.id)
      .eq("status", "running");

    if (taskId) {
      query = query.eq("task_id", taskId);
    }

    const { data: session, error } = await query.maybeSingle();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!session) {
      return {
        success: true,
        data: null,
      };
    }

    // Verify whether active session exceeded ceilings
    const check = await checkAndAutoCancelSession(supabase, session);
    if (check.expired) {
      return {
        success: true,
        data: null,
      };
    }

    return {
      success: true,
      data: session,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to get active session.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Updates an existing task after confirming ownership.
 */
export async function updateTaskAction(
  taskId: string,
  input: UpdateTaskInput
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Authentication required.",
      };
    }

    // 1. Enforce rate limiting: 30 updates per minute
    const rl = await rateLimit(user.id, "update_task");
    if (!rl.success) {
      return {
        success: false,
        error: rl.error,
        isRateLimited: true,
      };
    }

    // 2. Validate input with Zod
    const validation = updateTaskSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]?.message || "Invalid update parameters.",
      };
    }

    const {
      title,
      description,
      category,
      difficulty,
      status,
      due_date,
      focus_started_at,
      started_at,
    } = validation.data;

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description || null;
    if (category !== undefined) updates.category = category;
    if (difficulty !== undefined) updates.difficulty = difficulty;
    if (status !== undefined) updates.status = status;
    if (focus_started_at !== undefined) updates.focus_started_at = focus_started_at;
    if (started_at !== undefined) updates.started_at = started_at;
    if (due_date !== undefined) {
      updates.due_date = due_date && due_date.trim() !== "" ? due_date : null;
    }

    // Recalculate reward if category or difficulty changed
    if (category !== undefined || difficulty !== undefined) {
      const { data: currentTask } = await supabase
        .from("tasks")
        .select("category, difficulty")
        .eq("id", taskId)
        .eq("profile_id", user.id)
        .single();

      const cat = category || currentTask?.category || "Intellect";
      const diff = difficulty || currentTask?.difficulty || "medium";
      const reward = calculateTaskReward(cat, diff);
      updates.xp_reward = reward.xp;
      updates.currency_reward = reward.currency;
    }

    const { data: updatedTask, error: updateError } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId)
      .eq("profile_id", user.id)
      .select()
      .single();

    if (updateError) {
      return {
        success: false,
        error: updateError.message,
      };
    }

    revalidatePath("/dashboard/quests");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: updatedTask,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update quest.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Deletes a task after verifying ownership.
 */
export async function deleteTaskAction(taskId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Authentication required.",
      };
    }

    // 1. Enforce rate limiting: 30 deletes per minute
    const rl = await rateLimit(user.id, "delete_task");
    if (!rl.success) {
      return {
        success: false,
        error: rl.error,
        isRateLimited: true,
      };
    }

    const { error: deleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .eq("profile_id", user.id);

    if (deleteError) {
      return {
        success: false,
        error: deleteError.message,
      };
    }

    revalidatePath("/dashboard/quests");
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to remove quest.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Completes a task atomically via Postgres RPC.
 * Awards variable XP/currency, critical hits, combo streak bonuses, loot drops,
 * and handles streak comeback shields.
 */
export async function completeTaskAction(
  taskId: string
): Promise<ActionResult<TaskCompletionResult>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Authentication required.",
      };
    }

    // 1. Enforce rate limiting: 30 completions per minute
    const rl = await rateLimit(user.id, "complete_task");
    if (!rl.success) {
      return {
        success: false,
        error: rl.error,
        isRateLimited: true,
      };
    }

    // 2. Fetch task to check existence and verify 30-second minimum creation age floor
    const { data: existingTask } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .eq("profile_id", user.id)
      .single();

    if (!existingTask) {
      return {
        success: false,
        error: "Quest not found or does not belong to your character.",
      };
    }

    if (existingTask.status === "completed") {
      return {
        success: false,
        error: "Quest is already completed.",
      };
    }

    // Anti-cheat floor: Disallow instant completion (<30 seconds)
    const ageCheck = checkMinimumTaskAge(existingTask.created_at);
    if (!ageCheck.allowed) {
      return {
        success: false,
        error: ageCheck.message || "Give it a bit more time before completing",
      };
    }

    // 3. Call Atomic Postgres RPC function
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "complete_task_atomic",
      {
        p_task_id: taskId,
      }
    );

    if (rpcError) {
      // If RPC rejected for an intended validation or anti-cheat check, return that error directly
      const knownRejections = [
        "Give it a bit more time before completing",
        "Quest is already completed",
        "Quest not found",
        "User must be authenticated",
      ];
      if (knownRejections.some((msg) => rpcError.message.includes(msg))) {
        return {
          success: false,
          error: rpcError.message,
        };
      }

      // Graceful fallback if RPC is not yet deployed in remote Supabase:
      // Fetch profile for combo & shield calculations
      const { data: profile } = await supabase
        .from("profiles")
        .select(
          "current_xp, currency, level, last_completion_at, combo_count, streak_shields"
        )
        .eq("id", user.id)
        .single();

      // Query anti-cheat counts for fallback
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayStartIso = todayStart.toISOString();
      const twentyFourHoursAgo = new Date(
        Date.now() - 24 * 60 * 60 * 1000
      ).toISOString();
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

      const [hardRes, medRes, repeatRes, recentRes] = await Promise.all([
        supabase
          .from("tasks")
          .select("id")
          .eq("profile_id", user.id)
          .eq("status", "completed")
          .eq("difficulty", "hard")
          .gte("completed_at", todayStartIso),
        supabase
          .from("tasks")
          .select("id")
          .eq("profile_id", user.id)
          .eq("status", "completed")
          .eq("difficulty", "medium")
          .gte("completed_at", todayStartIso),
        supabase
          .from("tasks")
          .select("id")
          .eq("profile_id", user.id)
          .eq("status", "completed")
          .eq("category", existingTask.category)
          .ilike("title", existingTask.title.trim())
          .gt("completed_at", twentyFourHoursAgo),
        supabase
          .from("tasks")
          .select("id")
          .eq("profile_id", user.id)
          .eq("status", "completed")
          .gt("completed_at", tenMinutesAgo),
      ]);

      // Check for an active focus session to deduct paused time
      const { data: activeSession } = await supabase
        .from("task_sessions")
        .select("*")
        .eq("task_id", taskId)
        .eq("profile_id", user.id)
        .eq("status", "running")
        .maybeSingle();

      let sessionPausedSeconds = 0;
      let sessionStartedAt =
        existingTask.started_at || existingTask.focus_started_at;

      if (activeSession) {
        sessionStartedAt = activeSession.started_at;
        sessionPausedSeconds = activeSession.total_paused_seconds;
        if (activeSession.paused_at) {
          const pauseElapsed = Math.floor(
            (Date.now() - new Date(activeSession.paused_at).getTime()) / 1000
          );
          sessionPausedSeconds += Math.max(0, pauseElapsed);
        }

        // Close out session row
        await supabase
          .from("task_sessions")
          .update({
            status: "completed",
            ended_at: new Date().toISOString(),
            paused_at: null,
            total_paused_seconds: sessionPausedSeconds,
          })
          .eq("id", activeSession.id);
      }

      const rewardBreakdown = calculateFinalReward({
        declaredDifficulty: existingTask.difficulty || "medium",
        createdAt: existingTask.created_at,
        startedAt: sessionStartedAt,
        totalPausedSeconds: sessionPausedSeconds,
        completedAt: new Date().toISOString(),
        todayHardCompletionsCount: hardRes.data?.length || 0,
        todayMediumCompletionsCount: medRes.data?.length || 0,
        previousSameTitleCompletionsIn24h: repeatRes.data?.length || 0,
        completionsInLast10Minutes: recentRes.data?.length || 0,
        lastCompletionAt: profile?.last_completion_at,
        previousComboCount: profile?.combo_count,
      });

      // Mark task completed
      const { error: updateError } = await supabase
        .from("tasks")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", taskId)
        .eq("profile_id", user.id);

      if (updateError) {
        return {
          success: false,
          error: updateError.message,
        };
      }

      let charLevelUpInfo = {
        leveledUp: false,
        oldLevel: 1,
        newLevel: 1,
        levelsGained: 0,
        remainingXp: 0,
        xpNeeded: 50,
      };

      let newCurrency = 0;
      let newLevel = 1;
      let newXp = 0;

      if (profile) {
        const totalXp = profile.current_xp + rewardBreakdown.final.xp;
        const levelResult = checkLevelUp(profile.level, totalXp);
        newCurrency = profile.currency + rewardBreakdown.final.currency;
        newLevel = levelResult.newLevel;
        newXp = levelResult.remainingXp;

        charLevelUpInfo = {
          leveledUp: levelResult.leveledUp,
          oldLevel: profile.level,
          newLevel: levelResult.newLevel,
          levelsGained: levelResult.levelsGained,
          remainingXp: levelResult.remainingXp,
          xpNeeded: xpRequiredForLevel(levelResult.newLevel),
        };

        await supabase
          .from("profiles")
          .update({
            current_xp: levelResult.remainingXp,
            currency: newCurrency,
            level: levelResult.newLevel,
            last_completion_at: new Date().toISOString(),
            combo_count: rewardBreakdown.comboCount,
          })
          .eq("id", user.id);
      }

      // Increment attribute XP
      const { data: attr } = await supabase
        .from("attributes")
        .select("*")
        .eq("profile_id", user.id)
        .eq("name", existingTask.category)
        .maybeSingle();

      let attrLevelUpInfo = {
        leveledUp: false,
        attributeName: existingTask.category,
        oldLevel: 1,
        newLevel: 1,
        levelsGained: 0,
        remainingXp: 0,
        xpNeeded: 50,
      };

      if (attr) {
        const totalAttrXp = attr.current_xp + rewardBreakdown.final.xp;
        const attrResult = checkLevelUp(attr.level, totalAttrXp);
        attrLevelUpInfo = {
          leveledUp: attrResult.leveledUp,
          attributeName: existingTask.category,
          oldLevel: attr.level,
          newLevel: attrResult.newLevel,
          levelsGained: attrResult.levelsGained,
          remainingXp: attrResult.remainingXp,
          xpNeeded: xpRequiredForLevel(attrResult.newLevel),
        };

        await supabase
          .from("attributes")
          .update({
            current_xp: attrResult.remainingXp,
            level: attrResult.newLevel,
          })
          .eq("profile_id", user.id)
          .eq("name", existingTask.category);
      } else {
        const attrResult = checkLevelUp(1, rewardBreakdown.final.xp);
        attrLevelUpInfo = {
          leveledUp: attrResult.leveledUp,
          attributeName: existingTask.category,
          oldLevel: 1,
          newLevel: attrResult.newLevel,
          levelsGained: attrResult.levelsGained,
          remainingXp: attrResult.remainingXp,
          xpNeeded: xpRequiredForLevel(attrResult.newLevel),
        };

        await supabase.from("attributes").insert({
          profile_id: user.id,
          name: existingTask.category,
          level: attrResult.newLevel,
          current_xp: attrResult.remainingXp,
        });
      }

      revalidatePath("/dashboard/quests");
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/attributes");

      return {
        success: true,
        data: {
          task_id: taskId,
          base: rewardBreakdown.base,
          appliedMultipliers: rewardBreakdown.appliedMultipliers,
          final: rewardBreakdown.final,
          xpAwarded: rewardBreakdown.final.xp,
          currencyAwarded: rewardBreakdown.final.currency,
          wasCritical: rewardBreakdown.wasCritical,
          comboCount: rewardBreakdown.comboCount,
          comboMultiplier: rewardBreakdown.multipliers.comboMultiplier,
          lootDropped: null,
          leveledUp: charLevelUpInfo.leveledUp,
          newRankTitle: getRankTitle(newLevel),
          streakShieldConsumed: false,
          focusDowngraded: rewardBreakdown.multipliers.timingDowngraded,
          new_xp: newXp,
          new_currency: newCurrency,
          new_level: newLevel,
          category: existingTask.category,
          characterLevelUp: charLevelUpInfo,
          attributeLevelUp: attrLevelUpInfo,
        },
      };
    }

    revalidatePath("/dashboard/quests");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/attributes");

    return {
      success: true,
      data: rpcResult as TaskCompletionResult,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to complete quest.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Fetches today's 3 featured rotating daily quests shared across all adventurers.
 * Includes user-specific completion status.
 */
export async function getDailyQuestsAction(): Promise<
  ActionResult<DailyQuestItem[]>
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 1. Fetch or generate today's daily quests via RPC
    const { data: quests, error } = await supabase.rpc(
      "get_or_create_daily_quests"
    );

    let dailyQuestsList = quests as Array<{
      id: string;
      title: string;
      description: string | null;
      category: string;
      xp_reward: number;
      currency_reward: number;
      active_date: string;
    }> | null;

    if (error || !dailyQuestsList || dailyQuestsList.length === 0) {
      // Fallback query if RPC hasn't been applied
      const today = new Date().toISOString().split("T")[0];
      const { data: fallbackQuests } = await supabase
        .from("daily_quests")
        .select("*")
        .eq("active_date", today)
        .order("created_at", { ascending: true });

      dailyQuestsList = fallbackQuests || [];
    }

    // 2. Fetch completions for this user
    let completedSet = new Set<string>();
    if (user && dailyQuestsList && dailyQuestsList.length > 0) {
      const { data: completions } = await supabase
        .from("daily_quest_completions")
        .select("daily_quest_id")
        .eq("profile_id", user.id);

      if (completions) {
        completedSet = new Set(completions.map((c) => c.daily_quest_id));
      }
    }

    const results: DailyQuestItem[] = (dailyQuestsList || []).map((q) => ({
      id: q.id,
      title: q.title,
      description: q.description,
      category: q.category,
      xp_reward: q.xp_reward,
      currency_reward: q.currency_reward,
      active_date: q.active_date,
      isCompleted: completedSet.has(q.id),
    }));

    return {
      success: true,
      data: results,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to load daily quests.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Completes a featured rotating daily quest atomically.
 */
export async function completeDailyQuestAction(
  dailyQuestId: string
): Promise<ActionResult<TaskCompletionResult>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Authentication required.",
      };
    }

    // 1. Rate limiting: 30 completions per minute
    const rl = await rateLimit(user.id, "complete_daily_quest");
    if (!rl.success) {
      return {
        success: false,
        error: rl.error,
        isRateLimited: true,
      };
    }

    // 2. Execute atomic Postgres RPC
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "complete_daily_quest_atomic",
      {
        p_daily_quest_id: dailyQuestId,
      }
    );

    if (rpcError) {
      return {
        success: false,
        error: rpcError.message || "Failed to conquer daily quest.",
      };
    }

    revalidatePath("/dashboard/quests");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/attributes");

    return {
      success: true,
      data: rpcResult as TaskCompletionResult,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to conquer daily quest.";
    return {
      success: false,
      error: message,
    };
  }
}
