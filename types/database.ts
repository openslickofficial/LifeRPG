export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ItemType = "theme" | "badge" | "cosmetic";
export type TaskStatus = "pending" | "completed";

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  level: number;
  current_xp: number;
  currency: number;
  created_at: string;
  updated_at: string;
}

export interface Attribute {
  id: string;
  profile_id: string;
  name: string;
  level: number;
  current_xp: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  category: string;
  xp_reward: number;
  currency_reward: number;
  status: TaskStatus;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Streak {
  id: string;
  profile_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: ItemType;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  profile_id: string;
  item_id: string;
  purchased_at: string;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, "id">>;
      };
      attributes: {
        Row: Attribute;
        Insert: Omit<Attribute, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Attribute, "id">>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Task, "id">>;
      };
      streaks: {
        Row: Streak;
        Insert: Omit<Streak, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Streak, "id">>;
      };
      shop_items: {
        Row: ShopItem;
        Insert: Omit<ShopItem, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ShopItem, "id">>;
      };
      inventory: {
        Row: InventoryItem;
        Insert: Omit<InventoryItem, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<InventoryItem, "id">>;
      };
    };
  };
}
