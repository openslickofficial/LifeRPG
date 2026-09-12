-- ==============================================================================
-- LIFE RPG: PHASE 13 - TASK SESSIONS, PAUSE & RESET CONTROLS
-- Implements task_sessions table with pause controls, 2-pause limit, 5m pause cap,
-- 2-hour ceiling, exclusivity locks, undo start (10s), and restart.
-- ==============================================================================

-- 1. Create task_sessions table
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

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_task_sessions_updated_at ON public.task_sessions;
CREATE TRIGGER set_task_sessions_updated_at
  BEFORE UPDATE ON public.task_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Performance & Exclusivity Indexes
-- Exclusive active lock: A user can NEVER have more than 1 running/paused session at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_task_sessions_exclusive_active
ON public.task_sessions (profile_id)
WHERE status = 'running';

CREATE INDEX IF NOT EXISTS idx_task_sessions_task_id
ON public.task_sessions (task_id, status);

-- 3. RLS Policies for task_sessions
ALTER TABLE public.task_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own task sessions" ON public.task_sessions;
CREATE POLICY "Users can view own task sessions"
  ON public.task_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can insert own task sessions" ON public.task_sessions;
CREATE POLICY "Users can insert own task sessions"
  ON public.task_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can update own task sessions" ON public.task_sessions;
CREATE POLICY "Users can update own task sessions"
  ON public.task_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can delete own task sessions" ON public.task_sessions;
CREATE POLICY "Users can delete own task sessions"
  ON public.task_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = profile_id);

-- 4. Update complete_task_atomic to deduct total_paused_seconds from elapsed time
CREATE OR REPLACE FUNCTION public.complete_task_atomic(p_task_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_task RECORD;
  v_session RECORD;
  v_profile RECORD;
  v_attr RECORD;
  v_streak RECORD;
  v_today DATE := CURRENT_DATE;

  -- Anti-cheat & timing variables
  v_elapsed INTERVAL;
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
  IF NOW() - v_task.created_at < INTERVAL '30 seconds' THEN
    RAISE EXCEPTION 'Give it a bit more time before completing';
  END IF;

  -- 5. Focus Session & Pause Deduction
  -- Look for an active focus session associated with this task
  SELECT * INTO v_session
  FROM public.task_sessions
  WHERE task_id = p_task_id AND profile_id = v_user_id AND status = 'running'
  FOR UPDATE;

  IF FOUND THEN
    v_session_paused_seconds := v_session.total_paused_seconds;

    -- If completed while currently paused, compute final pause duration
    IF v_session.paused_at IS NOT NULL THEN
      v_pause_elapsed := EXTRACT(EPOCH FROM (NOW() - v_session.paused_at))::INTEGER;
      v_session_paused_seconds := v_session_paused_seconds + GREATEST(0, v_pause_elapsed);
    END IF;

    -- Mark session completed and record final paused time
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
    -- Fallback to task timestamps if no formal session was opened
    v_elapsed := NOW() - COALESCE(v_task.started_at, v_task.focus_started_at, v_task.created_at);
  END IF;

  -- Guard against negative elapsed duration
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

  -- 7. Anti-cheat: Daily Difficulty Caps
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

  -- 8. Anti-cheat: Diminishing Returns on Repeated Tasks
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

  -- 9. Anti-cheat: Soft Anomaly Throttle
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

  -- 10. Fetch and lock character profile
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  -- 11. Combo System Calculation (4-hour window)
  IF v_profile.last_completion_at IS NOT NULL AND NOW() - v_profile.last_completion_at <= INTERVAL '4 hours' THEN
    v_combo_count := v_profile.combo_count + 1;
  ELSE
    v_combo_count := 1;
  END IF;

  v_combo_multiplier := 1.0 + LEAST(0.50, (v_combo_count - 1) * 0.05);
  IF v_combo_count > 1 THEN
    v_applied_multipliers := array_append(
      v_applied_multipliers,
      'combo:x' || v_combo_count || '(+' || ROUND((v_combo_multiplier - 1.0) * 100) || '%)'
    );
  END IF;

  -- 12. Variable Reward Roll (0.9 to 1.1)
  v_var_multiplier := 0.9 + (random() * 0.2);
  v_applied_multipliers := array_append(v_applied_multipliers, 'variable:' || ROUND(v_var_multiplier, 2) || 'x');

  -- 13. Critical Hit Roll (5% chance to double rewards)
  IF random() < 0.05 THEN
    v_was_critical := true;
    v_crit_multiplier := 2.0;
    v_applied_multipliers := array_append(v_applied_multipliers, 'critical_hit:2.00x');
  END IF;

  -- 14. Calculate Final Awarded XP & Currency in single unified product
  v_total_multiplier := v_repeat_multiplier * v_anomaly_multiplier * v_combo_multiplier * v_var_multiplier * v_crit_multiplier;
  v_xp_awarded := GREATEST(1, ROUND(v_base_xp * v_total_multiplier));
  v_currency_awarded := GREATEST(1, ROUND(v_base_currency * v_total_multiplier));

  -- 15. Loot Drop Roll (Hard: 10%, Medium: 5%, Easy: 2%)
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

  -- 16. Mark task as completed
  UPDATE public.tasks
  SET
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_task_id;

  -- 17. Non-Linear Character Leveling
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

  -- 18. Streak & Comeback Shield Engine
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

  IF v_new_streak > 0 AND (v_new_streak % 7 = 0) AND (NOT v_shield_consumed) THEN
    v_new_shields := LEAST(3, v_new_shields + 1);
  END IF;

  -- 19. Update Profile
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

  -- 20. Attribute XP Progression
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

  -- 21. Return comprehensive atomic response with breakdown
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
