// Revel - Shared TypeScript Types

export type ThemeMode = "light" | "dark" | "system";

export interface UserStats {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  gold: number;
}

export interface QuestPlaceholder {
  id: string;
  title: string;
  category: "daily" | "habit" | "epic";
  xpReward: number;
  goldReward: number;
  completed: boolean;
}
