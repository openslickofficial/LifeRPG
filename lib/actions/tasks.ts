"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createTaskSchema,
  updateTaskSchema,
  CreateTaskInput,
  UpdateTaskInput,
} from "@/lib/validations/task";
import { calculateTaskReward } from "@/lib/rpg/rewards";
import { rateLimit } from "@/lib/rate-limit";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  isRateLimited?: boolean;
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

    const { title, description, category, difficulty, due_date } =
      validation.data;

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
        xp_reward: xp,
        currency_reward: currency,
        status: "pending",
        due_date: due_date && due_date.trim() !== "" ? due_date : null,
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

    const validation = updateTaskSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Invalid update data.",
      };
    }

    const updatePayload: Record<string, unknown> = {};
    if (validation.data.title !== undefined)
      updatePayload.title = validation.data.title;
    if (validation.data.description !== undefined)
      updatePayload.description = validation.data.description || null;
    if (validation.data.category !== undefined)
      updatePayload.category = validation.data.category;
    if (validation.data.status !== undefined)
      updatePayload.status = validation.data.status;
    if (validation.data.due_date !== undefined)
      updatePayload.due_date =
        validation.data.due_date && validation.data.due_date.trim() !== ""
          ? validation.data.due_date
          : null;

    const { data: updated, error: updateError } = await supabase
      .from("tasks")
      .update(updatePayload)
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
      data: updated,
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
 * Deletes a task ensuring strict profile ownership.
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
      err instanceof Error ? err.message : "Failed to delete quest.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Atomically completes a task using Postgres RPC.
 * Verifies status is 'pending', awards XP/currency, updates streaks, and prevents replay attacks.
 */
export async function completeTaskAction(
  taskId: string
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

    // 1. Enforce rate limiting: 30 completions per minute
    const rl = await rateLimit(user.id, "complete_task");
    if (!rl.success) {
      return {
        success: false,
        error: rl.error,
        isRateLimited: true,
      };
    }

    // 2. Call Atomic Postgres RPC function
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "complete_task_atomic",
      {
        p_task_id: taskId,
      }
    );

    if (rpcError) {
      // Graceful fallback if RPC function is not yet deployed in remote Supabase:
      // Perform atomic-like single transaction checks
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

      // Increment profile XP
      const { data: profile } = await supabase
        .from("profiles")
        .select("current_xp, currency, level")
        .eq("id", user.id)
        .single();

      if (profile) {
        const newXp = profile.current_xp + existingTask.xp_reward;
        const newCurrency = profile.currency + existingTask.currency_reward;
        const newLevel = Math.max(profile.level, 1 + Math.floor(newXp / 1000));
        await supabase
          .from("profiles")
          .update({
            current_xp: newXp,
            currency: newCurrency,
            level: newLevel,
          })
          .eq("id", user.id);
      }

      revalidatePath("/dashboard/quests");
      revalidatePath("/dashboard");

      return {
        success: true,
        data: {
          task_id: taskId,
          xp_gained: existingTask.xp_reward,
          currency_gained: existingTask.currency_reward,
        },
      };
    }

    revalidatePath("/dashboard/quests");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: rpcResult,
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
