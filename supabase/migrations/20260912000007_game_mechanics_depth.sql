-- Life RPG: Game Mechanics Depth & Progression Engine Migration
-- Adds:
-- 1. Profiles: last_completion_at, combo_count, streak_shields
-- 2. Shop Items: rarity column ('common', 'rare', 'epic')
-- 3. Tasks: difficulty, focus_started_at
-- 4. Daily Quests: daily_quests, daily_quest_completions, get_or_create_daily_quests()
-- 5. Atomic complete_task_atomic and complete_daily_quest_atomic with variable rewards, crits, combos, loot drops, and streak comeback shields.

-- 1. PROFILES Alterations
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_completion_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS combo_count INTEGER NOT NULL DEFAULT 0 CHECK (combo_count >= 0),
ADD COLUMN IF NOT EXISTS streak_shields INTEGER NOT NULL DEFAULT 0 CHECK (streak_shields >= 0 AND streak_shields <= 3);

-- 2. SHOP_ITEMS Alterations & Rarity Seeding
ALTER TABLE public.shop_items
ADD COLUMN IF NOT EXISTS rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic'));

UPDATE public.shop_items SET rarity = 'common' WHERE id = '00000000-0000-0000-0000-000000000001'; -- Cyberpunk Neon Theme
UPDATE public.shop_items SET rarity = 'rare' WHERE id = '00000000-0000-0000-0000-000000000002'; -- Midnight Obsidian Theme
UPDATE public.shop_items SET rarity = 'epic' WHERE id = '00000000-0000-0000-0000-000000000003'; -- Grandmaster Paladin Badge
UPDATE public.shop_items SET rarity = 'rare' WHERE id = '00000000-0000-0000-0000-000000000004'; -- Aura of Deep Work
UPDATE public.shop_items SET rarity = 'common' WHERE id = '00000000-0000-0000-0000-000000000005'; -- Arcane Focus Banner

-- 3. TASKS Alterations
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
ADD COLUMN IF NOT EXISTS focus_started_at TIMESTAMPTZ;

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

-- RLS for Daily Quests
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

-- 5. Daily Quest Rotation Generator (Check-on-request)
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
    -- Seed 3 featured rotating daily quests with +25% bonus multiplier
    -- (Base medium: 25 XP * 1.25 = 32 XP, 5 Gold * 1.25 = 7 Gold)
    -- (Base hard: 50 XP * 1.25 = 63 XP, 10 Gold * 1.25 = 13 Gold)
    -- (Base easy: 10 XP * 1.25 = 13 XP, 2 Gold * 1.25 = 3 Gold)
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

-- 7. Atomic Complete Task RPC (With Full Game Mechanics)
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

  -- Variable & Critical Hit multipliers
  v_base_xp INTEGER;
  v_base_currency INTEGER;
  v_var_multiplier NUMERIC;
  v_was_critical BOOLEAN := false;
  v_crit_multiplier NUMERIC := 1.0;
  v_focus_downgraded BOOLEAN := false;

  -- Combo system variables
  v_combo_count INTEGER := 1;
  v_combo_multiplier NUMERIC := 1.0;

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

  -- 3. Anti-cheat: Verify task is currently pending
  IF v_task.status = 'completed' THEN
    RAISE EXCEPTION 'Quest is already completed';
  END IF;

  -- 4. Focus Session Validation for Hard Tasks
  v_base_xp := v_task.xp_reward;
  v_base_currency := v_task.currency_reward;

  IF v_task.difficulty = 'hard' THEN
    -- If focus session was not started or exceeded 2 hours, apply soft downgrade to medium
    IF v_task.focus_started_at IS NULL OR NOW() - v_task.focus_started_at > INTERVAL '2 hours' THEN
      v_base_xp := 25;
      v_base_currency := 5;
      v_focus_downgraded := true;
    END IF;
  END IF;

  -- 5. Fetch and lock character profile
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  -- 6. Variable Reward Roll (0.9 to 1.1)
  v_var_multiplier := 0.9 + (random() * 0.2);

  -- 7. Critical Hit Roll (5% chance to double rewards)
  IF random() < 0.05 THEN
    v_was_critical := true;
    v_crit_multiplier := 2.0;
  END IF;

  -- 8. Combo System Calculation (4-hour window)
  IF v_profile.last_completion_at IS NOT NULL AND NOW() - v_profile.last_completion_at <= INTERVAL '4 hours' THEN
    v_combo_count := v_profile.combo_count + 1;
  ELSE
    v_combo_count := 1;
  END IF;

  -- +5% reward per combo step, capped at +50% at combo 10
  v_combo_multiplier := 1.0 + LEAST(0.50, (v_combo_count - 1) * 0.05);

  -- 9. Calculate Final Awarded XP & Currency
  v_xp_awarded := GREATEST(1, ROUND(v_base_xp * v_var_multiplier * v_crit_multiplier * v_combo_multiplier));
  v_currency_awarded := GREATEST(1, ROUND(v_base_currency * v_var_multiplier * v_crit_multiplier * v_combo_multiplier));

  -- 10. Loot Drop Roll (Hard: 10%, Medium: 5%, Easy: 2%)
  IF v_task.difficulty = 'hard' AND NOT v_focus_downgraded THEN
    v_drop_chance := 0.10;
  ELSIF v_task.difficulty = 'easy' THEN
    v_drop_chance := 0.02;
  ELSE
    v_drop_chance := 0.05;
  END IF;

  IF random() < v_drop_chance THEN
    -- Find a random unowned shop item weighted by rarity (common: 10, rare: 3, epic: 1)
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

  -- 11. Mark task as completed
  UPDATE public.tasks
  SET
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_task_id;

  -- 12. Non-Linear Character Leveling
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

  -- 13. Streak & Comeback Shield Engine
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
      -- Missed a day: Check Streak Shields
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

  -- Award +1 Streak Shield every 7 streak days (cap at 3)
  IF v_new_streak > 0 AND v_new_streak % 7 = 0 AND (v_streak.last_activity_date IS NULL OR v_streak.last_activity_date <> v_today) THEN
    v_new_shields := LEAST(3, v_new_shields + 1);
  END IF;

  -- Update profile state
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

  -- 14. Attribute non-linear leveling
  SELECT * INTO v_attr
  FROM public.attributes
  WHERE profile_id = v_user_id AND name = v_task.category
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
    VALUES (v_user_id, v_task.category, v_attr_level, v_attr_total_xp);
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
    WHERE profile_id = v_user_id AND name = v_task.category;
  END IF;

  -- 15. Return comprehensive standardized game-mechanic payload
  RETURN jsonb_build_object(
    'success', true,
    'task_id', p_task_id,
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
    'focusDowngraded', v_focus_downgraded,
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

  -- Variable & Critical Hit multipliers
  v_base_xp INTEGER;
  v_base_currency INTEGER;
  v_var_multiplier NUMERIC;
  v_was_critical BOOLEAN := false;
  v_crit_multiplier NUMERIC := 1.0;

  -- Combo system variables
  v_combo_count INTEGER := 1;
  v_combo_multiplier NUMERIC := 1.0;

  -- Final reward numbers
  v_xp_awarded INTEGER;
  v_currency_awarded INTEGER;

  -- Loot drop variables
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
    RAISE EXCEPTION 'User must be authenticated to complete daily quests';
  END IF;

  -- 2. Select daily quest
  SELECT * INTO v_daily
  FROM public.daily_quests
  WHERE id = p_daily_quest_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Daily quest not found';
  END IF;

  -- 3. Verify user has not already completed this daily quest today
  IF EXISTS (
    SELECT 1 FROM public.daily_quest_completions
    WHERE profile_id = v_user_id AND daily_quest_id = p_daily_quest_id
  ) THEN
    RAISE EXCEPTION 'Daily quest already conquered today';
  END IF;

  -- 4. Record daily quest completion
  INSERT INTO public.daily_quest_completions (profile_id, daily_quest_id, completed_at)
  VALUES (v_user_id, p_daily_quest_id, NOW());

  -- 5. Lock and fetch profile
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  -- 6. Variable Reward Roll (0.9 to 1.1)
  v_base_xp := v_daily.xp_reward;
  v_base_currency := v_daily.currency_reward;
  v_var_multiplier := 0.9 + (random() * 0.2);

  -- 7. Critical Hit Roll (5% chance to double rewards)
  IF random() < 0.05 THEN
    v_was_critical := true;
    v_crit_multiplier := 2.0;
  END IF;

  -- 8. Combo System Calculation (4-hour window)
  IF v_profile.last_completion_at IS NOT NULL AND NOW() - v_profile.last_completion_at <= INTERVAL '4 hours' THEN
    v_combo_count := v_profile.combo_count + 1;
  ELSE
    v_combo_count := 1;
  END IF;

  v_combo_multiplier := 1.0 + LEAST(0.50, (v_combo_count - 1) * 0.05);

  -- 9. Final Rewards
  v_xp_awarded := GREATEST(1, ROUND(v_base_xp * v_var_multiplier * v_crit_multiplier * v_combo_multiplier));
  v_currency_awarded := GREATEST(1, ROUND(v_base_currency * v_var_multiplier * v_crit_multiplier * v_combo_multiplier));

  -- 10. Loot Drop (Daily quests give medium-tier 5% drop rate)
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

  -- 11. Non-linear Leveling
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

  -- 12. Streak & Shield Engine
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

  -- 13. Attribute Progression
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
