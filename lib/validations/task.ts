import { z } from "zod";

export const TASK_CATEGORIES = [
  "Strength",
  "Intellect",
  "Discipline",
  "Creativity",
] as const;

export const TASK_DIFFICULTIES = ["easy", "medium", "hard"] as const;

export const taskCategorySchema = z.enum(TASK_CATEGORIES, {
  message: "Please choose a valid attribute category",
});

export const taskDifficultySchema = z.enum(TASK_DIFFICULTIES);

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Quest title is required")
    .max(100, "Quest title cannot exceed 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  category: taskCategorySchema,
  difficulty: taskDifficultySchema,
  due_date: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        const selectedDate = new Date(val);
        if (isNaN(selectedDate.getTime())) return false;
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        return selectedDate >= startOfToday;
      },
      { message: "Due date cannot be in the past" }
    )
    .or(z.literal("")),
  focus_started_at: z.string().optional().nullable(),
  started_at: z.string().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Quest title is required")
    .max(100, "Quest title cannot exceed 100 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  category: taskCategorySchema.optional(),
  difficulty: taskDifficultySchema.optional(),
  status: z.enum(["pending", "completed"]).optional(),
  focus_started_at: z.string().optional().nullable(),
  started_at: z.string().optional().nullable(),
  due_date: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        const selectedDate = new Date(val);
        if (isNaN(selectedDate.getTime())) return false;
        return true;
      },
      { message: "Invalid date format" }
    )
    .or(z.literal("")),
});

export type TaskCategory = z.infer<typeof taskCategorySchema>;
export type TaskDifficulty = z.infer<typeof taskDifficultySchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
