-- Life RPG: Shop Purchasing & Applied Theme System Migration
-- Adds applied_theme_id to profiles, atomic purchase RPC, and theme activation RPC.

-- 1. Add applied_theme_id to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS applied_theme_id UUID REFERENCES public.shop_items(id) ON DELETE SET NULL;

-- 2. Atomic Purchase Item RPC Function
CREATE OR REPLACE FUNCTION public.purchase_item_atomic(p_item_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_item RECORD;
  v_profile RECORD;
  v_new_currency INTEGER;
BEGIN
  -- 1. Verify caller authentication
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required to purchase items.', 'code', 'unauthenticated');
  END IF;

  -- 2. Select item from vault
  SELECT * INTO v_item
  FROM public.shop_items
  WHERE id = p_item_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found in adventurer shop.', 'code', 'item_not_found');
  END IF;

  -- 3. Check if user already owns this item in inventory
  IF EXISTS (SELECT 1 FROM public.inventory WHERE profile_id = v_user_id AND item_id = p_item_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'You already own this item in your inventory.', 'code', 'already_owned');
  END IF;

  -- 4. Lock and check profile currency balance
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  IF v_profile.currency < v_item.price THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient gold balance to purchase this item.',
      'code', 'insufficient_funds',
      'current_currency', v_profile.currency,
      'price', v_item.price
    );
  END IF;

  -- 5. Deduct price from profile currency atomically
  v_new_currency := v_profile.currency - v_item.price;

  UPDATE public.profiles
  SET
    currency = v_new_currency,
    updated_at = NOW()
  WHERE id = v_user_id;

  -- 6. Insert into character inventory
  INSERT INTO public.inventory (profile_id, item_id, purchased_at)
  VALUES (v_user_id, p_item_id, NOW());

  RETURN jsonb_build_object(
    'success', true,
    'item_id', p_item_id,
    'item_name', v_item.name,
    'item_type', v_item.type,
    'price_paid', v_item.price,
    'new_currency', v_new_currency
  );
END;
$$;

-- 3. Atomic Theme Application RPC Function
CREATE OR REPLACE FUNCTION public.apply_theme_atomic(p_theme_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_item RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required.', 'code', 'unauthenticated');
  END IF;

  -- If resetting to default theme
  IF p_theme_id IS NULL THEN
    UPDATE public.profiles
    SET applied_theme_id = NULL, updated_at = NOW()
    WHERE id = v_user_id;

    RETURN jsonb_build_object('success', true, 'applied_theme_id', NULL, 'theme_name', 'Default');
  END IF;

  -- Verify item exists and is a theme
  SELECT * INTO v_item
  FROM public.shop_items
  WHERE id = p_theme_id AND type = 'theme';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid theme item.', 'code', 'invalid_item');
  END IF;

  -- Verify user owns the theme
  IF NOT EXISTS (SELECT 1 FROM public.inventory WHERE profile_id = v_user_id AND item_id = p_theme_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'You do not own this theme yet.', 'code', 'not_owned');
  END IF;

  -- Apply theme to profile
  UPDATE public.profiles
  SET applied_theme_id = p_theme_id, updated_at = NOW()
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'applied_theme_id', p_theme_id,
    'theme_name', v_item.name
  );
END;
$$;
