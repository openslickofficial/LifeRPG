-- Life RPG: Atomic Task Completion Postgres RPC Function
-- Atomically completes a task, rewards XP/currency, updates attributes, and advances streaks.

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
  v_streak RECORD;
  v_new_xp INTEGER;
  v_new_currency INTEGER;
  v_new_level INTEGER;
  v_new_streak INTEGER;
  v_longest_streak INTEGER;
  v_today DATE := CURRENT_DATE;
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

  -- 5. Fetch and update character profile (FOR UPDATE)
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  v_new_xp := v_profile.current_xp + v_task.xp_reward;
  v_new_currency := v_profile.currency + v_task.currency_reward;
  
  -- Recalculate level (1000 XP per level bracket)
  v_new_level := GREATEST(v_profile.level, 1 + FLOOR(v_new_xp / 1000));

  UPDATE public.profiles
  SET
    current_xp = v_new_xp,
    currency = v_new_currency,
    level = v_new_level,
    updated_at = NOW()
  WHERE id = v_user_id;

  -- 6. Upsert and increment matching attribute XP
  INSERT INTO public.attributes (profile_id, name, level, current_xp)
  VALUES (v_user_id, v_task.category, 1, v_task.xp_reward)
  ON CONFLICT (profile_id, name) DO UPDATE
  SET
    current_xp = public.attributes.current_xp + v_task.xp_reward,
    level = GREATEST(public.attributes.level, 1 + FLOOR((public.attributes.current_xp + v_task.xp_reward) / 500)),
    updated_at = NOW();

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
      -- Already recorded activity today: maintain streak
      v_new_streak := v_streak.current_streak;
      v_longest_streak := v_streak.longest_streak;
    ELSIF v_streak.last_activity_date = v_today - 1 THEN
      -- Consecutive day: increment streak
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
      -- Streak broken (or first activity): reset to 1
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

  -- 8. Return comprehensive payload
  RETURN jsonb_build_object(
    'success', true,
    'task_id', p_task_id,
    'xp_gained', v_task.xp_reward,
    'currency_gained', v_task.currency_reward,
    'new_xp', v_new_xp,
    'new_currency', v_new_currency,
    'new_level', v_new_level,
    'new_streak', v_new_streak,
    'longest_streak', v_longest_streak,
    'category', v_task.category
  );
END;
$$;
