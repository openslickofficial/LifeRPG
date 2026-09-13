-- =============================================================================
-- Revel: Complete Supabase Database Setup Script
-- Paste this entire script into the Supabase Dashboard SQL Editor to initialize:
-- 1. Tables (profiles, attributes, tasks, streaks, shop_items, inventory)
-- 2. Row Level Security (RLS) on all tables with explicit policies
-- 3. Automatic Character Profile & Streaks Creation Trigger on auth.users
-- 4. Sample Shop Items Seed Data
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SECTION 1: EXTENSIONS & HELPER FUNCTIONS
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- SECTION 2: TABLES DDL
-- -----------------------------------------------------------------------------

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  current_xp INTEGER NOT NULL DEFAULT 0 CHECK (current_xp >= 0),
  currency INTEGER NOT NULL DEFAULT 0 CHECK (currency >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Attributes
CREATE TABLE IF NOT EXISTS public.attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  current_xp INTEGER NOT NULL DEFAULT 0 CHECK (current_xp >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_attributes_profile_name UNIQUE (profile_id, name)
);

DROP TRIGGER IF EXISTS set_attributes_updated_at ON public.attributes;
CREATE TRIGGER set_attributes_updated_at
  BEFORE UPDATE ON public.attributes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  xp_reward INTEGER NOT NULL CHECK (xp_reward >= 0),
  currency_reward INTEGER NOT NULL DEFAULT 0 CHECK (currency_reward >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_tasks_updated_at ON public.tasks;
CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Streaks
CREATE TABLE IF NOT EXISTS public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_activity_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_streaks_updated_at ON public.streaks;
CREATE TRIGGER set_streaks_updated_at
  BEFORE UPDATE ON public.streaks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Shop Items
CREATE TABLE IF NOT EXISTS public.shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  type TEXT NOT NULL CHECK (type IN ('theme', 'badge', 'cosmetic')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_shop_items_updated_at ON public.shop_items;
CREATE TRIGGER set_shop_items_updated_at
  BEFORE UPDATE ON public.shop_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inventory
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.shop_items(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_inventory_profile_item UNIQUE (profile_id, item_id)
);

DROP TRIGGER IF EXISTS set_inventory_updated_at ON public.inventory;
CREATE TRIGGER set_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_attributes_profile_id ON public.attributes(profile_id);
CREATE INDEX IF NOT EXISTS idx_tasks_profile_id ON public.tasks(profile_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_inventory_profile_id ON public.inventory(profile_id);
CREATE INDEX IF NOT EXISTS idx_shop_items_type ON public.shop_items(type);

-- -----------------------------------------------------------------------------
-- SECTION 3: ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

-- 1. Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- 2. Attributes RLS
ALTER TABLE public.attributes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own attributes" ON public.attributes;
CREATE POLICY "Users can view own attributes"
  ON public.attributes FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own attributes" ON public.attributes;
CREATE POLICY "Users can insert own attributes"
  ON public.attributes FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own attributes" ON public.attributes;
CREATE POLICY "Users can update own attributes"
  ON public.attributes FOR UPDATE TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own attributes" ON public.attributes;
CREATE POLICY "Users can delete own attributes"
  ON public.attributes FOR DELETE TO authenticated
  USING (profile_id = auth.uid());

-- 3. Tasks RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
CREATE POLICY "Users can insert own tasks"
  ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE TO authenticated
  USING (profile_id = auth.uid());

-- 4. Streaks RLS
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own streaks" ON public.streaks;
CREATE POLICY "Users can view own streaks"
  ON public.streaks FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own streaks" ON public.streaks;
CREATE POLICY "Users can insert own streaks"
  ON public.streaks FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own streaks" ON public.streaks;
CREATE POLICY "Users can update own streaks"
  ON public.streaks FOR UPDATE TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own streaks" ON public.streaks;
CREATE POLICY "Users can delete own streaks"
  ON public.streaks FOR DELETE TO authenticated
  USING (profile_id = auth.uid());

-- 5. Shop Items RLS (Public read for authenticated users, non-writable)
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view shop items" ON public.shop_items;
CREATE POLICY "Authenticated users can view shop items"
  ON public.shop_items FOR SELECT TO authenticated
  USING (true);

-- 6. Inventory RLS
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own inventory" ON public.inventory;
CREATE POLICY "Users can view own inventory"
  ON public.inventory FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own inventory" ON public.inventory;
CREATE POLICY "Users can insert own inventory"
  ON public.inventory FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own inventory" ON public.inventory;
CREATE POLICY "Users can update own inventory"
  ON public.inventory FOR UPDATE TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own inventory" ON public.inventory;
CREATE POLICY "Users can delete own inventory"
  ON public.inventory FOR DELETE TO authenticated
  USING (profile_id = auth.uid());

-- -----------------------------------------------------------------------------
-- SECTION 4: AUTOMATIC USER SIGNUP TRIGGER
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
BEGIN
  -- Determine username from user metadata, email prefix, or fallback
  base_username := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
    NULLIF(TRIM(split_part(NEW.email, '@', 1)), ''),
    'adventurer'
  );

  final_username := base_username;

  -- Handle collision if username exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) THEN
    final_username := base_username || '_' || SUBSTR(NEW.id::text, 1, 4);
  END IF;

  -- 1. Create character profile
  INSERT INTO public.profiles (
    id,
    username,
    avatar_url,
    level,
    current_xp,
    currency
  ) VALUES (
    NEW.id,
    final_username,
    NEW.raw_user_meta_data->>'avatar_url',
    1,
    0,
    0
  );

  -- 2. Create initial streak tracking row
  INSERT INTO public.streaks (
    profile_id,
    current_streak,
    longest_streak,
    last_activity_date
  ) VALUES (
    NEW.id,
    0,
    0,
    NULL
  );

  -- 3. Initialize default starter attributes
  INSERT INTO public.attributes (profile_id, name, level, current_xp)
  VALUES
    (NEW.id, 'Strength', 1, 0),
    (NEW.id, 'Intellect', 1, 0),
    (NEW.id, 'Discipline', 1, 0),
    (NEW.id, 'Creativity', 1, 0)
  ON CONFLICT (profile_id, name) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- SECTION 5: SAMPLE SEED DATA
-- -----------------------------------------------------------------------------
INSERT INTO public.shop_items (id, name, description, price, type)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Cyberpunk Neon Theme',
    'Transforms your HUD with high-contrast glowing neon cyan and magenta accents for high-energy focus.',
    250,
    'theme'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Midnight Obsidian Theme',
    'Deep OLED-black aesthetics with subtle luminescent borders engineered for nocturnal focus sprints.',
    300,
    'theme'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Grandmaster Paladin Badge',
    'A prestigious golden emblem displayed on your character sheet signifying relentless daily discipline.',
    500,
    'badge'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'Aura of Deep Work',
    'A radiant arcane particle glow surrounding your character avatar during uninterrupted work sessions.',
    400,
    'cosmetic'
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'Arcane Focus Banner',
    'An illustrated profile header banner infused with focus runes and glowing guild insignia.',
    150,
    'cosmetic'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  type = EXCLUDED.type;

-- -----------------------------------------------------------------------------
-- SECTION 6: ATOMIC TASK COMPLETION & LEVELING PROGRESSION RPC
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.complete_task_atomic(p_task_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_task RECORD;
  v_profile RECORD;
  v_attr RECORD;
  v_streak RECORD;
  v_today DATE := CURRENT_DATE;

  -- Character leveling variables
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_total_xp INTEGER;
  v_new_currency INTEGER;
  v_char_leveled_up BOOLEAN := false;
  v_char_levels_gained INTEGER := 0;

  -- Attribute leveling variables
  v_attr_old_level INTEGER := 1;
  v_attr_level INTEGER := 1;
  v_attr_total_xp INTEGER := 0;
  v_attr_leveled_up BOOLEAN := false;
  v_attr_levels_gained INTEGER := 0;

  -- Streak variables
  v_new_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  -- 1. Verify caller authentication
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to complete quests';
  END IF;

  -- 2. Select and lock task row (FOR UPDATE prevents double-completion races)
  SELECT * INTO v_task
  FROM public.tasks
  WHERE id = p_task_id AND profile_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quest not found or does not belong to your character';
  END IF;

  -- 3. Anti-cheat: Verify task is currently pending
  IF v_task.status = 'completed' THEN
    RAISE EXCEPTION 'Quest is already completed';
  END IF;

  -- 4. Mark task as completed
  UPDATE public.tasks
  SET
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_task_id;

  -- 5. Fetch and lock character profile
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  v_old_level := v_profile.level;
  v_new_level := v_profile.level;
  v_total_xp := v_profile.current_xp + v_task.xp_reward;
  v_new_currency := v_profile.currency + v_task.currency_reward;

  -- Non-linear leveling loop: Math.round(50 * Math.pow(level, 1.5))
  WHILE v_total_xp >= ROUND(50 * POWER(v_new_level, 1.5)) LOOP
    v_total_xp := v_total_xp - ROUND(50 * POWER(v_new_level, 1.5));
    v_new_level := v_new_level + 1;
  END LOOP;

  v_char_levels_gained := v_new_level - v_old_level;
  v_char_leveled_up := (v_char_levels_gained > 0);

  UPDATE public.profiles
  SET
    current_xp = v_total_xp,
    currency = v_new_currency,
    level = v_new_level,
    updated_at = NOW()
  WHERE id = v_user_id;

  -- 6. Attribute non-linear leveling
  SELECT * INTO v_attr
  FROM public.attributes
  WHERE profile_id = v_user_id AND name = v_task.category
  FOR UPDATE;

  IF NOT FOUND THEN
    v_attr_old_level := 1;
    v_attr_level := 1;
    v_attr_total_xp := v_task.xp_reward;

    WHILE v_attr_total_xp >= ROUND(50 * POWER(v_attr_level, 1.5)) LOOP
      v_attr_total_xp := v_attr_total_xp - ROUND(50 * POWER(v_attr_level, 1.5));
      v_attr_level := v_attr_level + 1;
    END LOOP;

    v_attr_levels_gained := v_attr_level - v_attr_old_level;
    v_attr_leveled_up := (v_attr_levels_gained > 0);

    INSERT INTO public.attributes (profile_id, name, level, current_xp)
    VALUES (v_user_id, v_task.category, v_attr_level, v_attr_total_xp);
  ELSE
    v_attr_old_level := v_attr.level;
    v_attr_level := v_attr.level;
    v_attr_total_xp := v_attr.current_xp + v_task.xp_reward;

    WHILE v_attr_total_xp >= ROUND(50 * POWER(v_attr_level, 1.5)) LOOP
      v_attr_total_xp := v_attr_total_xp - ROUND(50 * POWER(v_attr_level, 1.5));
      v_attr_level := v_attr_level + 1;
    END LOOP;

    v_attr_levels_gained := v_attr_level - v_attr_old_level;
    v_attr_leveled_up := (v_attr_levels_gained > 0);

    UPDATE public.attributes
    SET
      level = v_attr_level,
      current_xp = v_attr_total_xp,
      updated_at = NOW()
    WHERE profile_id = v_user_id AND name = v_task.category;
  END IF;

  -- 7. Update Daily Streak
  SELECT * INTO v_streak
  FROM public.streaks
  WHERE profile_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    v_new_streak := 1;
    v_longest_streak := 1;
    INSERT INTO public.streaks (profile_id, current_streak, longest_streak, last_activity_date)
    VALUES (v_user_id, 1, 1, v_today);
  ELSE
    IF v_streak.last_activity_date = v_today THEN
      v_new_streak := v_streak.current_streak;
      v_longest_streak := v_streak.longest_streak;
    ELSIF v_streak.last_activity_date = v_today - 1 THEN
      v_new_streak := v_streak.current_streak + 1;
      v_longest_streak := GREATEST(v_streak.longest_streak, v_new_streak);
      UPDATE public.streaks
      SET
        current_streak = v_new_streak,
        longest_streak = v_longest_streak,
        last_activity_date = v_today,
        updated_at = NOW()
      WHERE profile_id = v_user_id;
    ELSE
      v_new_streak := 1;
      v_longest_streak := GREATEST(v_streak.longest_streak, 1);
      UPDATE public.streaks
      SET
        current_streak = 1,
        longest_streak = v_longest_streak,
        last_activity_date = v_today,
        updated_at = NOW()
      WHERE profile_id = v_user_id;
    END IF;
  END IF;

  -- 8. Return comprehensive payload for client delight celebrations
  RETURN jsonb_build_object(
    'success', true,
    'task_id', p_task_id,
    'xp_gained', v_task.xp_reward,
    'currency_gained', v_task.currency_reward,
    'new_xp', v_total_xp,
    'new_currency', v_new_currency,
    'new_level', v_new_level,
    'new_streak', v_new_streak,
    'longest_streak', v_longest_streak,
    'category', v_task.category,
    'characterLevelUp', jsonb_build_object(
      'leveledUp', v_char_leveled_up,
      'oldLevel', v_old_level,
      'newLevel', v_new_level,
      'levelsGained', v_char_levels_gained,
      'remainingXp', v_total_xp,
      'xpNeeded', ROUND(50 * POWER(v_new_level, 1.5))
    ),
    'attributeLevelUp', jsonb_build_object(
      'leveledUp', v_attr_leveled_up,
      'attributeName', v_task.category,
      'oldLevel', v_attr_old_level,
      'newLevel', v_attr_level,
      'levelsGained', v_attr_levels_gained,
      'remainingXp', v_attr_total_xp,
      'xpNeeded', ROUND(50 * POWER(v_attr_level, 1.5))
    )
  );
END;
$$;

-- -----------------------------------------------------------------------------
-- SECTION 6: BACKFILL EXISTING AUTH USERS
-- (Safely creates profile, streaks, and attributes for users who signed up
--  prior to running this schema migration script)
-- -----------------------------------------------------------------------------
INSERT INTO public.profiles (id, username, avatar_url, level, current_xp, currency)
SELECT 
  u.id,
  COALESCE(
    NULLIF(TRIM(u.raw_user_meta_data->>'username'), ''),
    NULLIF(TRIM(split_part(u.email, '@', 1)), ''),
    'adventurer_' || SUBSTR(u.id::text, 1, 6)
  ),
  u.raw_user_meta_data->>'avatar_url',
  1, 0, 0
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.streaks (profile_id, current_streak, longest_streak)
SELECT u.id, 0, 0
FROM auth.users u
ON CONFLICT (profile_id) DO NOTHING;

INSERT INTO public.attributes (profile_id, name, level, current_xp)
SELECT u.id, a.name, 1, 0
FROM auth.users u
CROSS JOIN (VALUES ('Strength'), ('Intellect'), ('Discipline'), ('Creativity')) AS a(name)
ON CONFLICT (profile_id, name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- SECTION 7: PHASE 11 GAME MECHANICS DEPTH
-- Profiles combo/shields, shop item rarities, task focus, daily quests, & updated RPCs
-- -----------------------------------------------------------------------------

-- 1. PROFILES Alterations
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_completion_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS combo_count INTEGER NOT NULL DEFAULT 0 CHECK (combo_count >= 0),
ADD COLUMN IF NOT EXISTS streak_shields INTEGER NOT NULL DEFAULT 0 CHECK (streak_shields >= 0 AND streak_shields <= 3);

-- 2. SHOP_ITEMS Alterations & Rarity Seeding
ALTER TABLE public.shop_items
ADD COLUMN IF NOT EXISTS rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic'));

UPDATE public.shop_items SET rarity = 'common' WHERE id = '00000000-0000-0000-0000-000000000001';
UPDATE public.shop_items SET rarity = 'rare' WHERE id = '00000000-0000-0000-0000-000000000002';
UPDATE public.shop_items SET rarity = 'epic' WHERE id = '00000000-0000-0000-0000-000000000003';
UPDATE public.shop_items SET rarity = 'rare' WHERE id = '00000000-0000-0000-0000-000000000004';
UPDATE public.shop_items SET rarity = 'common' WHERE id = '00000000-0000-0000-0000-000000000005';

-- 3. TASKS Alterations
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
ADD COLUMN IF NOT EXISTS focus_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_tasks_repeat_check ON public.tasks (profile_id, category, status, completed_at);
CREATE INDEX IF NOT EXISTS idx_tasks_recent_throttle ON public.tasks (profile_id, status, completed_at);
CREATE INDEX IF NOT EXISTS idx_tasks_daily_caps ON public.tasks (profile_id, difficulty, status, completed_at);

-- 3b. TASK SESSIONS System (Focus timer, Pause & Reset controls)
CREATE TABLE IF NOT EXISTS public.task_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'cancelled')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  total_paused_seconds INTEGER NOT NULL DEFAULT 0 CHECK (total_paused_seconds >= 0),
  pause_count INTEGER NOT NULL DEFAULT 0 CHECK (pause_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_task_sessions_updated_at ON public.task_sessions;
CREATE TRIGGER set_task_sessions_updated_at
  BEFORE UPDATE ON public.task_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE UNIQUE INDEX IF NOT EXISTS idx_task_sessions_exclusive_active
ON public.task_sessions (profile_id)
WHERE status = 'running';

CREATE INDEX IF NOT EXISTS idx_task_sessions_task_id
ON public.task_sessions (task_id, status);

ALTER TABLE public.task_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own task sessions" ON public.task_sessions;
CREATE POLICY "Users can view own task sessions"
  ON public.task_sessions FOR SELECT TO authenticated
  USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can insert own task sessions" ON public.task_sessions;
CREATE POLICY "Users can insert own task sessions"
  ON public.task_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can update own task sessions" ON public.task_sessions;
CREATE POLICY "Users can update own task sessions"
  ON public.task_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can delete own task sessions" ON public.task_sessions;
CREATE POLICY "Users can delete own task sessions"
  ON public.task_sessions FOR DELETE TO authenticated
  USING (auth.uid() = profile_id);

-- 4. DAILY QUESTS System
CREATE TABLE IF NOT EXISTS public.daily_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  xp_reward INTEGER NOT NULL CHECK (xp_reward >= 0),
  currency_reward INTEGER NOT NULL CHECK (currency_reward >= 0),
  active_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_quests_active_date ON public.daily_quests(active_date);

CREATE TABLE IF NOT EXISTS public.daily_quest_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  daily_quest_id UUID NOT NULL REFERENCES public.daily_quests(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_daily_quest_completion UNIQUE (profile_id, daily_quest_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_quest_completions_user ON public.daily_quest_completions(profile_id);

ALTER TABLE public.daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quest_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view daily quests" ON public.daily_quests;
CREATE POLICY "Anyone can view daily quests"
  ON public.daily_quests FOR SELECT TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS "Users can view their daily quest completions" ON public.daily_quest_completions;
CREATE POLICY "Users can view their daily quest completions"
  ON public.daily_quest_completions FOR SELECT TO authenticated
  USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can insert their daily quest completions" ON public.daily_quest_completions;
CREATE POLICY "Users can insert their daily quest completions"
  ON public.daily_quest_completions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = profile_id);

-- 5. Daily Quest Rotation Generator
CREATE OR REPLACE FUNCTION public.get_or_create_daily_quests()
RETURNS SETOF public.daily_quests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT count(*) INTO v_count
  FROM public.daily_quests
  WHERE active_date = v_today;

  IF v_count < 3 THEN
    INSERT INTO public.daily_quests (title, description, category, xp_reward, currency_reward, active_date)
    SELECT q.title, q.description, q.category, q.xp_reward, q.currency_reward, v_today
    FROM (
      VALUES
        ('Iron Core Challenge (50 Pushups & Plank)', 'Execute a high-tension bodyweight routine with strict cadence.', 'Strength', 32, 7),
        ('Aerobic Tempo Sprint (25-Min Run or HIIT)', 'Drive heart rate into tier 4 cardio zone to forge stamina.', 'Strength', 32, 7),
        ('Hydration Grail (Consume 2.5L Water)', 'Maintain optimal neural hydration across the workday.', 'Strength', 13, 3),
        ('Lorekeeper Session (Read 25 Pages Non-Fiction)', 'Deep cognitive absorption from an engineering or philosophy text.', 'Intellect', 32, 7),
        ('Code Architecture Breakdown (Analyze 1 Spec/RFC)', 'Dissect complex system design patterns with handwritten diagrams.', 'Intellect', 32, 7),
        ('Tactical Vocabulary Drill (15-Min Study)', 'Complete a flashcard sprint in foreign language or technical jargon.', 'Intellect', 13, 3),
        ('Deep Work Bastion (90-Min Focus Sprint)', 'Zero social media, zero context switches. Pure high-leverage flow.', 'Discipline', 63, 13),
        ('Dawn Vanguard (Wake before 7:00 AM)', 'Conquer morning inertia and claim the early hours for yourself.', 'Discipline', 32, 7),
        ('Digital Sunset (No Screens 45m Before Bed)', 'Shield melatonin production and reset circadian rhythm.', 'Discipline', 32, 7),
        ('Artisan Draft (500 Words of Original Writing)', 'Formulate an essay, article, or design document from scratch.', 'Creativity', 32, 7),
        ('Sonic Studio Session (30m Music / Audio Practice)', 'Explore melodic arrangements or acoustic dexterity.', 'Creativity', 32, 7),
        ('Concept Matrix (Synthesize 5 Unconventional Ideas)', 'Connect disparate concepts into novel product hypotheses.', 'Creativity', 13, 3)
    ) AS q(title, description, category, xp_reward, currency_reward)
    ORDER BY random()
    LIMIT 3;
  END IF;

  RETURN QUERY
  SELECT *
  FROM public.daily_quests
  WHERE active_date = v_today
  ORDER BY created_at ASC;
END;
$$;

-- 6. Helper: Level to Rank Title Function
CREATE OR REPLACE FUNCTION public.get_rank_title(p_level INTEGER)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_level >= 35 THEN 'Legend'
    WHEN p_level >= 20 THEN 'Hero'
    WHEN p_level >= 10 THEN 'Veteran'
    WHEN p_level >= 5 THEN 'Adventurer'
    ELSE 'Novice'
  END;
$$;

-- 7. Overwrite complete_task_atomic with Game Mechanics Depth & Anti-Cheat Hardening
CREATE OR REPLACE FUNCTION public.complete_task_atomic(p_task_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_task RECORD;
  v_profile RECORD;
  v_attr RECORD;
  v_streak RECORD;
  v_today DATE := CURRENT_DATE;

  -- Anti-cheat & timing variables
  v_elapsed INTERVAL;
  v_session RECORD;
  v_session_paused_seconds INTEGER := 0;
  v_pause_elapsed INTEGER := 0;
  v_declared_diff TEXT;
  v_qualifying_diff TEXT;
  v_timing_downgraded BOOLEAN := false;
  v_daily_cap_downgraded BOOLEAN := false;
  v_today_hard_count INTEGER := 0;
  v_today_medium_count INTEGER := 0;
  v_repeat_count INTEGER := 0;
  v_recent_10m_count INTEGER := 0;

  -- Applied multipliers tracking
  v_applied_multipliers TEXT[] := ARRAY[]::TEXT[];
  v_base_xp INTEGER;
  v_base_currency INTEGER;
  v_repeat_multiplier NUMERIC := 1.0;
  v_anomaly_multiplier NUMERIC := 1.0;
  v_combo_multiplier NUMERIC := 1.0;
  v_var_multiplier NUMERIC := 1.0;
  v_crit_multiplier NUMERIC := 1.0;
  v_was_critical BOOLEAN := false;
  v_total_multiplier NUMERIC := 1.0;

  -- Combo system variables
  v_combo_count INTEGER := 1;

  -- Final reward numbers
  v_xp_awarded INTEGER;
  v_currency_awarded INTEGER;

  -- Loot drop variables
  v_drop_chance NUMERIC;
  v_loot_dropped JSONB := NULL;
  v_loot_item RECORD;

  -- Streak & Shield variables
  v_shield_consumed BOOLEAN := false;
  v_new_shields INTEGER := 0;
  v_new_streak INTEGER := 1;
  v_longest_streak INTEGER := 1;

  -- Leveling variables
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_total_xp INTEGER;
  v_new_currency INTEGER;
  v_char_leveled_up BOOLEAN := false;
  v_char_levels_gained INTEGER := 0;

  -- Attribute leveling variables
  v_attr_old_level INTEGER := 1;
  v_attr_level INTEGER := 1;
  v_attr_total_xp INTEGER := 0;
  v_attr_leveled_up BOOLEAN := false;
  v_attr_levels_gained INTEGER := 0;
BEGIN
  -- 1. Verify caller authentication
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to complete quests';
  END IF;

  -- 2. Select and lock task row (FOR UPDATE prevents double-completion races)
  SELECT * INTO v_task
  FROM public.tasks
  WHERE id = p_task_id AND profile_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quest not found or does not belong to your character';
  END IF;

  -- 3. Anti-cheat check: Verify task is currently pending
  IF v_task.status = 'completed' THEN
    RAISE EXCEPTION 'Quest is already completed';
  END IF;

  -- 4. Anti-cheat check: 30-Second Minimum Task Age Floor
  -- Halts instant create-and-complete bot scripts without punishing genuine quick tasks
  IF NOW() - v_task.created_at < INTERVAL '30 seconds' THEN
    RAISE EXCEPTION 'Give it a bit more time before completing';
  END IF;

  -- 5. Focus Session & Pause Deduction
  SELECT * INTO v_session
  FROM public.task_sessions
  WHERE task_id = p_task_id AND profile_id = v_user_id AND status = 'running'
  FOR UPDATE;

  IF FOUND THEN
    v_session_paused_seconds := v_session.total_paused_seconds;

    IF v_session.paused_at IS NOT NULL THEN
      v_pause_elapsed := EXTRACT(EPOCH FROM (NOW() - v_session.paused_at))::INTEGER;
      v_session_paused_seconds := v_session_paused_seconds + GREATEST(0, v_pause_elapsed);
    END IF;

    UPDATE public.task_sessions
    SET
      status = 'completed',
      ended_at = NOW(),
      paused_at = NULL,
      total_paused_seconds = v_session_paused_seconds,
      updated_at = NOW()
    WHERE id = v_session.id;

    -- Actual focused duration = (completed_at - started_at) - total_paused_seconds
    v_elapsed := (NOW() - v_session.started_at) - (v_session_paused_seconds * INTERVAL '1 second');
  ELSE
    v_elapsed := NOW() - COALESCE(v_task.started_at, v_task.focus_started_at, v_task.created_at);
  END IF;

  IF v_elapsed < INTERVAL '0 seconds' THEN
    v_elapsed := INTERVAL '0 seconds';
  END IF;

  -- 6. Anti-cheat: Task Timing & Difficulty Verification
  v_declared_diff := COALESCE(v_task.difficulty, 'medium');
  v_qualifying_diff := v_declared_diff;

  IF v_declared_diff = 'hard' THEN
    IF v_elapsed >= INTERVAL '20 minutes' THEN
      v_qualifying_diff := 'hard';
    ELSIF v_elapsed >= INTERVAL '5 minutes' THEN
      v_qualifying_diff := 'medium';
      v_timing_downgraded := true;
    ELSE
      v_qualifying_diff := 'easy';
      v_timing_downgraded := true;
    END IF;
  ELSIF v_declared_diff = 'medium' THEN
    IF v_elapsed >= INTERVAL '5 minutes' THEN
      v_qualifying_diff := 'medium';
    ELSE
      v_qualifying_diff := 'easy';
      v_timing_downgraded := true;
    END IF;
  ELSE
    v_qualifying_diff := 'easy';
  END IF;

  IF v_timing_downgraded THEN
    v_applied_multipliers := array_append(
      v_applied_multipliers,
      'timing_downgrade:' || v_declared_diff || '->' || v_qualifying_diff
    );
  END IF;

  -- 6. Anti-cheat: Daily Difficulty Caps
  -- Hard capped at 5 full rewards per day; Medium capped at 10 full rewards per day
  IF v_qualifying_diff = 'hard' THEN
    SELECT COUNT(*) INTO v_today_hard_count
    FROM public.tasks
    WHERE profile_id = v_user_id
      AND status = 'completed'
      AND difficulty = 'hard'
      AND completed_at >= date_trunc('day', NOW());

    IF v_today_hard_count >= 5 THEN
      v_qualifying_diff := 'medium';
      v_daily_cap_downgraded := true;
      v_applied_multipliers := array_append(
        v_applied_multipliers,
        'daily_cap:hard_limit(5)->medium'
      );
    END IF;
  END IF;

  IF v_qualifying_diff = 'medium' THEN
    SELECT COUNT(*) INTO v_today_medium_count
    FROM public.tasks
    WHERE profile_id = v_user_id
      AND status = 'completed'
      AND difficulty = 'medium'
      AND completed_at >= date_trunc('day', NOW());

    IF v_today_medium_count >= 10 THEN
      v_qualifying_diff := 'easy';
      v_daily_cap_downgraded := true;
      v_applied_multipliers := array_append(
        v_applied_multipliers,
        'daily_cap:medium_limit(10)->easy'
      );
    END IF;
  END IF;

  -- Base reward determined strictly server-side by qualifying difficulty tier
  IF v_qualifying_diff = 'hard' THEN
    v_base_xp := 50;
    v_base_currency := 10;
  ELSIF v_qualifying_diff = 'medium' THEN
    v_base_xp := 25;
    v_base_currency := 5;
  ELSE
    v_base_xp := 10;
    v_base_currency := 2;
  END IF;

  -- 7. Anti-cheat: Diminishing Returns on Repeated Tasks
  -- Count tasks with the same (category, title) completed within the last 24 hours
  SELECT COUNT(*) INTO v_repeat_count
  FROM public.tasks
  WHERE profile_id = v_user_id
    AND status = 'completed'
    AND category = v_task.category
    AND LOWER(TRIM(title)) = LOWER(TRIM(v_task.title))
    AND completed_at > NOW() - INTERVAL '24 hours';

  IF v_repeat_count = 0 THEN
    v_repeat_multiplier := 1.0;
  ELSIF v_repeat_count = 1 THEN
    v_repeat_multiplier := 0.7;
    v_applied_multipliers := array_append(v_applied_multipliers, 'repeat_decay:0.70x');
  ELSIF v_repeat_count = 2 THEN
    v_repeat_multiplier := 0.4;
    v_applied_multipliers := array_append(v_applied_multipliers, 'repeat_decay:0.40x');
  ELSE
    v_repeat_multiplier := 0.15;
    v_applied_multipliers := array_append(v_applied_multipliers, 'repeat_decay:0.15x');
  END IF;

  -- 8. Anti-cheat: Soft Anomaly Throttle
  -- If user completed > 8 tasks in the last 10 minutes, apply temporary 50% reduction
  SELECT COUNT(*) INTO v_recent_10m_count
  FROM public.tasks
  WHERE profile_id = v_user_id
    AND status = 'completed'
    AND completed_at > NOW() - INTERVAL '10 minutes';

  IF v_recent_10m_count > 8 THEN
    v_anomaly_multiplier := 0.5;
    v_applied_multipliers := array_append(v_applied_multipliers, 'anomaly_throttle:0.50x');
  ELSE
    v_anomaly_multiplier := 1.0;
  END IF;

  -- 9. Fetch and lock character profile
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  -- 10. Combo System Calculation (4-hour window)
  IF v_profile.last_completion_at IS NOT NULL AND NOW() - v_profile.last_completion_at <= INTERVAL '4 hours' THEN
    v_combo_count := v_profile.combo_count + 1;
  ELSE
    v_combo_count := 1;
  END IF;

  -- +5% reward per combo step, capped at +50% at combo 10
  v_combo_multiplier := 1.0 + LEAST(0.50, (v_combo_count - 1) * 0.05);
  IF v_combo_count > 1 THEN
    v_applied_multipliers := array_append(
      v_applied_multipliers,
      'combo:x' || v_combo_count || '(+' || ROUND((v_combo_multiplier - 1.0) * 100) || '%)'
    );
  END IF;

  -- 11. Variable Reward Roll (0.9 to 1.1)
  v_var_multiplier := 0.9 + (random() * 0.2);
  v_applied_multipliers := array_append(v_applied_multipliers, 'variable:' || ROUND(v_var_multiplier, 2) || 'x');

  -- 12. Critical Hit Roll (5% chance to double rewards)
  IF random() < 0.05 THEN
    v_was_critical := true;
    v_crit_multiplier := 2.0;
    v_applied_multipliers := array_append(v_applied_multipliers, 'critical_hit:2.00x');
  END IF;

  -- 13. Calculate Final Awarded XP & Currency in single unified product
  v_total_multiplier := v_repeat_multiplier * v_anomaly_multiplier * v_combo_multiplier * v_var_multiplier * v_crit_multiplier;
  v_xp_awarded := GREATEST(1, ROUND(v_base_xp * v_total_multiplier));
  v_currency_awarded := GREATEST(1, ROUND(v_base_currency * v_total_multiplier));

  -- 14. Loot Drop Roll (Hard: 10%, Medium: 5%, Easy: 2%)
  IF v_qualifying_diff = 'hard' THEN
    v_drop_chance := 0.10;
  ELSIF v_qualifying_diff = 'easy' THEN
    v_drop_chance := 0.02;
  ELSE
    v_drop_chance := 0.05;
  END IF;

  IF random() < v_drop_chance THEN
    SELECT s.* INTO v_loot_item
    FROM public.shop_items s
    WHERE NOT EXISTS (
      SELECT 1 FROM public.inventory i WHERE i.profile_id = v_user_id AND i.item_id = s.id
    )
    ORDER BY (
      CASE s.rarity
        WHEN 'common' THEN 10
        WHEN 'rare' THEN 3
        WHEN 'epic' THEN 1
        ELSE 5
      END
    ) * random() DESC
    LIMIT 1;

    IF FOUND THEN
      INSERT INTO public.inventory (profile_id, item_id, purchased_at)
      VALUES (v_user_id, v_loot_item.id, NOW());

      v_loot_dropped := jsonb_build_object(
        'id', v_loot_item.id,
        'name', v_loot_item.name,
        'type', v_loot_item.type,
        'rarity', v_loot_item.rarity
      );
    END IF;
  END IF;

  -- 15. Mark task as completed
  UPDATE public.tasks
  SET
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_task_id;

  -- 16. Non-Linear Character Leveling
  v_old_level := v_profile.level;
  v_new_level := v_profile.level;
  v_total_xp := v_profile.current_xp + v_xp_awarded;
  v_new_currency := v_profile.currency + v_currency_awarded;

  WHILE v_total_xp >= ROUND(50 * POWER(v_new_level, 1.5)) LOOP
    v_total_xp := v_total_xp - ROUND(50 * POWER(v_new_level, 1.5));
    v_new_level := v_new_level + 1;
  END LOOP;

  v_char_levels_gained := v_new_level - v_old_level;
  v_char_leveled_up := (v_char_levels_gained > 0);

  -- 17. Streak & Comeback Shield Engine
  v_new_shields := v_profile.streak_shields;

  SELECT * INTO v_streak
  FROM public.streaks
  WHERE profile_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    v_new_streak := 1;
    v_longest_streak := 1;
    INSERT INTO public.streaks (profile_id, current_streak, longest_streak, last_activity_date)
    VALUES (v_user_id, 1, 1, v_today);
  ELSE
    IF v_streak.last_activity_date = v_today THEN
      v_new_streak := v_streak.current_streak;
      v_longest_streak := v_streak.longest_streak;
    ELSIF v_streak.last_activity_date = v_today - 1 THEN
      v_new_streak := v_streak.current_streak + 1;
      v_longest_streak := GREATEST(v_streak.longest_streak, v_new_streak);
      UPDATE public.streaks
      SET
        current_streak = v_new_streak,
        longest_streak = v_longest_streak,
        last_activity_date = v_today,
        updated_at = NOW()
      WHERE profile_id = v_user_id;
    ELSE
      IF v_profile.streak_shields > 0 THEN
        v_shield_consumed := true;
        v_new_shields := v_profile.streak_shields - 1;
        v_new_streak := v_streak.current_streak + 1;
        v_longest_streak := GREATEST(v_streak.longest_streak, v_new_streak);
        UPDATE public.streaks
        SET
          current_streak = v_new_streak,
          longest_streak = v_longest_streak,
          last_activity_date = v_today,
          updated_at = NOW()
        WHERE profile_id = v_user_id;
      ELSE
        v_new_streak := 1;
        v_longest_streak := v_streak.longest_streak;
        UPDATE public.streaks
        SET
          current_streak = 1,
          last_activity_date = v_today,
          updated_at = NOW()
        WHERE profile_id = v_user_id;
      END IF;
    END IF;
  END IF;

  -- +1 Shield earned every 7 streak days, capped at 3
  IF v_new_streak > 0 AND (v_new_streak % 7 = 0) AND (NOT v_shield_consumed) THEN
    v_new_shields := LEAST(3, v_new_shields + 1);
  END IF;

  -- 18. Update Profile
  UPDATE public.profiles
  SET
    level = v_new_level,
    current_xp = v_total_xp,
    currency = v_new_currency,
    last_completion_at = NOW(),
    combo_count = v_combo_count,
    streak_shields = v_new_shields,
    updated_at = NOW()
  WHERE id = v_user_id;

  -- 19. Attribute XP Progression
  SELECT * INTO v_attr
  FROM public.attributes
  WHERE profile_id = v_user_id AND name = v_task.category
  FOR UPDATE;

  IF FOUND THEN
    v_attr_old_level := v_attr.level;
    v_attr_level := v_attr.level;
    v_attr_total_xp := v_attr.current_xp + v_xp_awarded;

    WHILE v_attr_total_xp >= ROUND(50 * POWER(v_attr_level, 1.5)) LOOP
      v_attr_total_xp := v_attr_total_xp - ROUND(50 * POWER(v_attr_level, 1.5));
      v_attr_level := v_attr_level + 1;
    END LOOP;

    v_attr_levels_gained := v_attr_level - v_attr_old_level;
    v_attr_leveled_up := (v_attr_levels_gained > 0);

    UPDATE public.attributes
    SET
      level = v_attr_level,
      current_xp = v_attr_total_xp,
      updated_at = NOW()
    WHERE id = v_attr.id;
  ELSE
    v_attr_level := 1;
    v_attr_total_xp := v_xp_awarded;

    WHILE v_attr_total_xp >= ROUND(50 * POWER(v_attr_level, 1.5)) LOOP
      v_attr_total_xp := v_attr_total_xp - ROUND(50 * POWER(v_attr_level, 1.5));
      v_attr_level := v_attr_level + 1;
    END LOOP;

    v_attr_levels_gained := v_attr_level - 1;
    v_attr_leveled_up := (v_attr_levels_gained > 0);

    INSERT INTO public.attributes (profile_id, name, level, current_xp)
    VALUES (v_user_id, v_task.category, v_attr_level, v_attr_total_xp);
  END IF;

  -- 20. Return comprehensive atomic response with breakdown
  RETURN jsonb_build_object(
    'task_id', p_task_id,
    'base', jsonb_build_object(
      'xp', v_base_xp,
      'currency', v_base_currency,
      'declaredDifficulty', v_declared_diff,
      'qualifyingDifficulty', v_qualifying_diff
    ),
    'appliedMultipliers', to_jsonb(v_applied_multipliers),
    'final', jsonb_build_object(
      'xp', v_xp_awarded,
      'currency', v_currency_awarded
    ),
    'xpAwarded', v_xp_awarded,
    'currencyAwarded', v_currency_awarded,
    'wasCritical', v_was_critical,
    'comboCount', v_combo_count,
    'comboMultiplier', ROUND(v_combo_multiplier, 2),
    'lootDropped', v_loot_dropped,
    'leveledUp', v_char_leveled_up,
    'newRankTitle', public.get_rank_title(v_new_level),
    'streakShieldConsumed', v_shield_consumed,
    'streakShields', v_new_shields,
    'focusDowngraded', v_timing_downgraded,
    'new_xp', v_total_xp,
    'new_currency', v_new_currency,
    'new_level', v_new_level,
    'new_streak', v_new_streak,
    'longest_streak', v_longest_streak,
    'category', v_task.category,
    'characterLevelUp', jsonb_build_object(
      'leveledUp', v_char_leveled_up,
      'oldLevel', v_old_level,
      'newLevel', v_new_level,
      'levelsGained', v_char_levels_gained,
      'remainingXp', v_total_xp,
      'xpNeeded', ROUND(50 * POWER(v_new_level, 1.5))
    ),
    'attributeLevelUp', jsonb_build_object(
      'leveledUp', v_attr_leveled_up,
      'attributeName', v_task.category,
      'oldLevel', v_attr_old_level,
      'newLevel', v_attr_level,
      'levelsGained', v_attr_levels_gained,
      'remainingXp', v_attr_total_xp,
      'xpNeeded', ROUND(50 * POWER(v_attr_level, 1.5))
    )
  );
END;
$$;

-- 8. Atomic Complete Daily Quest RPC
CREATE OR REPLACE FUNCTION public.complete_daily_quest_atomic(p_daily_quest_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_daily RECORD;
  v_profile RECORD;
  v_attr RECORD;
  v_streak RECORD;
  v_today DATE := CURRENT_DATE;

  v_base_xp INTEGER;
  v_base_currency INTEGER;
  v_var_multiplier NUMERIC;
  v_was_critical BOOLEAN := false;
  v_crit_multiplier NUMERIC := 1.0;

  v_combo_count INTEGER := 1;
  v_combo_multiplier NUMERIC := 1.0;

  v_xp_awarded INTEGER;
  v_currency_awarded INTEGER;

  v_loot_dropped JSONB := NULL;
  v_loot_item RECORD;

  v_shield_consumed BOOLEAN := false;
  v_new_shields INTEGER := 0;
  v_new_streak INTEGER := 1;
  v_longest_streak INTEGER := 1;

  v_old_level INTEGER;
  v_new_level INTEGER;
  v_total_xp INTEGER;
  v_new_currency INTEGER;
  v_char_leveled_up BOOLEAN := false;
  v_char_levels_gained INTEGER := 0;

  v_attr_old_level INTEGER := 1;
  v_attr_level INTEGER := 1;
  v_attr_total_xp INTEGER := 0;
  v_attr_leveled_up BOOLEAN := false;
  v_attr_levels_gained INTEGER := 0;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to complete daily quests';
  END IF;

  SELECT * INTO v_daily
  FROM public.daily_quests
  WHERE id = p_daily_quest_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Daily quest not found';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.daily_quest_completions
    WHERE profile_id = v_user_id AND daily_quest_id = p_daily_quest_id
  ) THEN
    RAISE EXCEPTION 'Daily quest already conquered today';
  END IF;

  INSERT INTO public.daily_quest_completions (profile_id, daily_quest_id, completed_at)
  VALUES (v_user_id, p_daily_quest_id, NOW());

  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  v_base_xp := v_daily.xp_reward;
  v_base_currency := v_daily.currency_reward;
  v_var_multiplier := 0.9 + (random() * 0.2);

  IF random() < 0.05 THEN
    v_was_critical := true;
    v_crit_multiplier := 2.0;
  END IF;

  IF v_profile.last_completion_at IS NOT NULL AND NOW() - v_profile.last_completion_at <= INTERVAL '4 hours' THEN
    v_combo_count := v_profile.combo_count + 1;
  ELSE
    v_combo_count := 1;
  END IF;

  v_combo_multiplier := 1.0 + LEAST(0.50, (v_combo_count - 1) * 0.05);

  v_xp_awarded := GREATEST(1, ROUND(v_base_xp * v_var_multiplier * v_crit_multiplier * v_combo_multiplier));
  v_currency_awarded := GREATEST(1, ROUND(v_base_currency * v_var_multiplier * v_crit_multiplier * v_combo_multiplier));

  IF random() < 0.05 THEN
    SELECT s.* INTO v_loot_item
    FROM public.shop_items s
    WHERE NOT EXISTS (
      SELECT 1 FROM public.inventory i WHERE i.profile_id = v_user_id AND i.item_id = s.id
    )
    ORDER BY (
      CASE s.rarity
        WHEN 'common' THEN 10
        WHEN 'rare' THEN 3
        WHEN 'epic' THEN 1
        ELSE 5
      END
    ) * random() DESC
    LIMIT 1;

    IF FOUND THEN
      INSERT INTO public.inventory (profile_id, item_id, purchased_at)
      VALUES (v_user_id, v_loot_item.id, NOW());

      v_loot_dropped := jsonb_build_object(
        'id', v_loot_item.id,
        'name', v_loot_item.name,
        'type', v_loot_item.type,
        'rarity', v_loot_item.rarity
      );
    END IF;
  END IF;

  v_old_level := v_profile.level;
  v_new_level := v_profile.level;
  v_total_xp := v_profile.current_xp + v_xp_awarded;
  v_new_currency := v_profile.currency + v_currency_awarded;

  WHILE v_total_xp >= ROUND(50 * POWER(v_new_level, 1.5)) LOOP
    v_total_xp := v_total_xp - ROUND(50 * POWER(v_new_level, 1.5));
    v_new_level := v_new_level + 1;
  END LOOP;

  v_char_levels_gained := v_new_level - v_old_level;
  v_char_leveled_up := (v_char_levels_gained > 0);

  v_new_shields := v_profile.streak_shields;

  SELECT * INTO v_streak
  FROM public.streaks
  WHERE profile_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    v_new_streak := 1;
    v_longest_streak := 1;
    INSERT INTO public.streaks (profile_id, current_streak, longest_streak, last_activity_date)
    VALUES (v_user_id, 1, 1, v_today);
  ELSE
    IF v_streak.last_activity_date = v_today THEN
      v_new_streak := v_streak.current_streak;
      v_longest_streak := v_streak.longest_streak;
    ELSIF v_streak.last_activity_date = v_today - 1 THEN
      v_new_streak := v_streak.current_streak + 1;
      v_longest_streak := GREATEST(v_streak.longest_streak, v_new_streak);
      UPDATE public.streaks
      SET
        current_streak = v_new_streak,
        longest_streak = v_longest_streak,
        last_activity_date = v_today,
        updated_at = NOW()
      WHERE profile_id = v_user_id;
    ELSE
      IF v_profile.streak_shields > 0 THEN
        v_shield_consumed := true;
        v_new_shields := v_profile.streak_shields - 1;
        v_new_streak := v_streak.current_streak + 1;
        v_longest_streak := GREATEST(v_streak.longest_streak, v_new_streak);
        UPDATE public.streaks
        SET
          current_streak = v_new_streak,
          longest_streak = v_longest_streak,
          last_activity_date = v_today,
          updated_at = NOW()
        WHERE profile_id = v_user_id;
      ELSE
        v_new_streak := 1;
        v_longest_streak := GREATEST(v_streak.longest_streak, 1);
        UPDATE public.streaks
        SET
          current_streak = 1,
          longest_streak = v_longest_streak,
          last_activity_date = v_today,
          updated_at = NOW()
        WHERE profile_id = v_user_id;
      END IF;
    END IF;
  END IF;

  IF v_new_streak > 0 AND v_new_streak % 7 = 0 AND (v_streak.last_activity_date IS NULL OR v_streak.last_activity_date <> v_today) THEN
    v_new_shields := LEAST(3, v_new_shields + 1);
  END IF;

  UPDATE public.profiles
  SET
    current_xp = v_total_xp,
    currency = v_new_currency,
    level = v_new_level,
    last_completion_at = NOW(),
    combo_count = v_combo_count,
    streak_shields = v_new_shields,
    updated_at = NOW()
  WHERE id = v_user_id;

  SELECT * INTO v_attr
  FROM public.attributes
  WHERE profile_id = v_user_id AND name = v_daily.category
  FOR UPDATE;

  IF NOT FOUND THEN
    v_attr_old_level := 1;
    v_attr_level := 1;
    v_attr_total_xp := v_xp_awarded;

    WHILE v_attr_total_xp >= ROUND(50 * POWER(v_attr_level, 1.5)) LOOP
      v_attr_total_xp := v_attr_total_xp - ROUND(50 * POWER(v_attr_level, 1.5));
      v_attr_level := v_attr_level + 1;
    END LOOP;

    v_attr_levels_gained := v_attr_level - v_attr_old_level;
    v_attr_leveled_up := (v_attr_levels_gained > 0);

    INSERT INTO public.attributes (profile_id, name, level, current_xp)
    VALUES (v_user_id, v_daily.category, v_attr_level, v_attr_total_xp);
  ELSE
    v_attr_old_level := v_attr.level;
    v_attr_level := v_attr.level;
    v_attr_total_xp := v_attr.current_xp + v_xp_awarded;

    WHILE v_attr_total_xp >= ROUND(50 * POWER(v_attr_level, 1.5)) LOOP
      v_attr_total_xp := v_attr_total_xp - ROUND(50 * POWER(v_attr_level, 1.5));
      v_attr_level := v_attr_level + 1;
    END LOOP;

    v_attr_levels_gained := v_attr_level - v_attr_old_level;
    v_attr_leveled_up := (v_attr_levels_gained > 0);

    UPDATE public.attributes
    SET
      level = v_attr_level,
      current_xp = v_attr_total_xp,
      updated_at = NOW()
    WHERE profile_id = v_user_id AND name = v_daily.category;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'daily_quest_id', p_daily_quest_id,
    'xpAwarded', v_xp_awarded,
    'currencyAwarded', v_currency_awarded,
    'wasCritical', v_was_critical,
    'comboCount', v_combo_count,
    'comboMultiplier', ROUND(v_combo_multiplier, 2),
    'lootDropped', v_loot_dropped,
    'leveledUp', v_char_leveled_up,
    'newRankTitle', public.get_rank_title(v_new_level),
    'streakShieldConsumed', v_shield_consumed,
    'streakShields', v_new_shields,
    'new_xp', v_total_xp,
    'new_currency', v_new_currency,
    'new_level', v_new_level,
    'new_streak', v_new_streak,
    'longest_streak', v_longest_streak,
    'category', v_daily.category,
    'characterLevelUp', jsonb_build_object(
      'leveledUp', v_char_leveled_up,
      'oldLevel', v_old_level,
      'newLevel', v_new_level,
      'levelsGained', v_char_levels_gained,
      'remainingXp', v_total_xp,
      'xpNeeded', ROUND(50 * POWER(v_new_level, 1.5))
    ),
    'attributeLevelUp', jsonb_build_object(
      'leveledUp', v_attr_leveled_up,
      'attributeName', v_daily.category,
      'oldLevel', v_attr_old_level,
      'newLevel', v_attr_level,
      'levelsGained', v_attr_levels_gained,
      'remainingXp', v_attr_total_xp,
      'xpNeeded', ROUND(50 * POWER(v_attr_level, 1.5))
    )
  );
END;
$$;


