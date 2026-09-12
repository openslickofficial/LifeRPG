-- Life RPG: Automatic Profile & Streak Creation Trigger
-- Fires when a new user signs up in auth.users, initializing their character.

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
  -- Determine initial username from user metadata, email prefix, or fallback
  base_username := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
    NULLIF(TRIM(split_part(NEW.email, '@', 1)), ''),
    'adventurer'
  );

  final_username := base_username;

  -- Ensure uniqueness: append 4 characters of user id if username already taken
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) THEN
    final_username := base_username || '_' || SUBSTR(NEW.id::text, 1, 4);
  END IF;

  -- 1. Create character profile row
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

  -- 3. Initialize default starter attributes (Strength, Intellect, Discipline, Creativity)
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

-- Trigger binding on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
