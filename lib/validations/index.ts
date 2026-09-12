import { z } from "zod";

// Schema for user profile/stats validation
export const userStatsSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters"),
  level: z.number().int().min(1).default(1),
  xp: z.number().nonnegative().default(0),
  health: z.number().min(0).max(100).default(100),
  mana: z.number().min(0).max(100).default(50),
});

// Schema for quest creation/editing
export const questSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(500).optional(),
  category: z.enum(["daily", "habit", "epic"]).default("daily"),
  difficulty: z.enum(["easy", "medium", "hard", "boss"]).default("medium"),
  xpReward: z.number().positive().default(50),
  goldReward: z.number().nonnegative().default(10),
});

export type UserStatsInput = z.infer<typeof userStatsSchema>;
export type QuestInput = z.infer<typeof questSchema>;
