-- Life RPG: Leveling Progression Engine RPC Function
-- Calculates non-linear leveling curves with multi-level rollover for character and attributes atomically.

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
