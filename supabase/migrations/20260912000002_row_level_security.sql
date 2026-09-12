-- Life RPG: Row Level Security (RLS) Policies
-- Enforces strict multi-tenant isolation across all tables.

-- =============================================================================
-- 1. PROFILES TABLE RLS
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);


-- =============================================================================
-- 2. ATTRIBUTES TABLE RLS
-- =============================================================================
ALTER TABLE public.attributes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attributes"
  ON public.attributes
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert own attributes"
  ON public.attributes
  FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own attributes"
  ON public.attributes
  FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can delete own attributes"
  ON public.attributes
  FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());


-- =============================================================================
-- 3. TASKS TABLE RLS
-- =============================================================================
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON public.tasks
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert own tasks"
  ON public.tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own tasks"
  ON public.tasks
  FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can delete own tasks"
  ON public.tasks
  FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());


-- =============================================================================
-- 4. STREAKS TABLE RLS
-- =============================================================================
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks"
  ON public.streaks
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert own streaks"
  ON public.streaks
  FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own streaks"
  ON public.streaks
  FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can delete own streaks"
  ON public.streaks
  FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());


-- =============================================================================
-- 5. SHOP_ITEMS TABLE RLS
-- =============================================================================
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

-- Readable by any authenticated user; NOT writable by standard users
CREATE POLICY "Authenticated users can view shop items"
  ON public.shop_items
  FOR SELECT
  TO authenticated
  USING (true);


-- =============================================================================
-- 6. INVENTORY TABLE RLS
-- =============================================================================
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventory"
  ON public.inventory
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert own inventory"
  ON public.inventory
  FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own inventory"
  ON public.inventory
  FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can delete own inventory"
  ON public.inventory
  FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());
