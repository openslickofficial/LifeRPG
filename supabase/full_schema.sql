-- =============================================================================
-- Life RPG: Complete Supabase Database Setup Script
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
    (NEW.id, 'Discipline', 1, 0)
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
