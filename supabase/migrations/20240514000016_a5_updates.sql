-- =============================================================================
-- 016_a5_updates.sql
-- Aligning rewards and community schemas with A5 requirements.
-- =============================================================================

-- 1. Enhance rewards.reward_items
ALTER TABLE rewards.reward_items ADD COLUMN IF NOT EXISTS code text UNIQUE;
ALTER TABLE rewards.reward_items ADD COLUMN IF NOT EXISTS activation_type text NOT NULL DEFAULT 'manual_fulfillment';
ALTER TABLE rewards.reward_items ADD COLUMN IF NOT EXISTS activation_config jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE rewards.reward_items ADD COLUMN IF NOT EXISTS valid_days integer;

-- 2. Enhance rewards.vouchers
ALTER TABLE rewards.vouchers ADD COLUMN IF NOT EXISTS issued_by text NOT NULL DEFAULT 'system';
ALTER TABLE rewards.vouchers ADD COLUMN IF NOT EXISTS issued_reason text;
ALTER TABLE rewards.vouchers ADD COLUMN IF NOT EXISTS redeemed_at timestamptz;

-- 3. Create issue_voucher function
CREATE OR REPLACE FUNCTION rewards.issue_voucher(
  p_bearer_id uuid,
  p_reward_item_id uuid,
  p_reason text
)
RETURNS uuid AS $$
DECLARE
  v_voucher_id uuid;
  v_valid_days integer;
  v_expires_at timestamptz;
  v_code text;
  v_activation_type text;
BEGIN
  -- Get reward item config
  SELECT valid_days, activation_type INTO v_valid_days, v_activation_type 
  FROM rewards.reward_items WHERE id = p_reward_item_id;
  
  IF v_valid_days IS NOT NULL THEN
    v_expires_at := now() + (v_valid_days || ' days')::interval;
  END IF;

  -- If it's an external code, pull from pool
  IF v_activation_type = 'external_code' THEN
    SELECT code INTO v_code 
    FROM rewards.external_code_pool 
    WHERE reward_item_id = p_reward_item_id AND is_allocated = false
    LIMIT 1 FOR UPDATE;
    
    IF v_code IS NULL THEN
      RAISE EXCEPTION 'OUT_OF_STOCK: No external codes available for this reward.';
    END IF;
    
    UPDATE rewards.external_code_pool SET is_allocated = true WHERE code = v_code;
  ELSE
    -- Generate a unique internal code
    v_code := 'MARTIE-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 12));
  END IF;

  INSERT INTO rewards.vouchers (reward_item_id, bearer_id, status, code, expires_at, issued_reason)
  VALUES (p_reward_item_id, p_bearer_id, 'available', v_code, v_expires_at, p_reason)
  RETURNING id INTO v_voucher_id;

  RETURN v_voucher_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create a better wallet view that includes vouchers
-- We'll name it rewards.voucher_wallet to avoid conflict with community.taster_wallet
CREATE OR REPLACE VIEW rewards.voucher_wallet AS
SELECT
  v.id,
  v.bearer_id,
  ri.name AS display_name,
  ri.description,
  ri.activation_type,
  v.status,
  v.created_at AS issued_at,
  v.expires_at,
  v.redeemed_at,
  CASE
    WHEN v.status = 'available' AND (v.expires_at IS NULL OR v.expires_at > now())
    THEN true ELSE false
  END AS is_redeemable
FROM rewards.vouchers v
JOIN rewards.reward_items ri ON ri.id = v.reward_item_id;

-- Ensure RLS on the view or the underlying tables
-- The view will respect RLS of the underlying tables.
GRANT SELECT ON rewards.voucher_wallet TO authenticated;

-- 5. Enhanced redeem_voucher
CREATE OR REPLACE FUNCTION rewards.redeem_voucher(p_voucher_id uuid, p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v vouchers%ROWTYPE;
  ri reward_items%ROWTYPE;
  v_result jsonb;
BEGIN
  -- 1. Fetch and lock the voucher row
  SELECT * INTO v FROM rewards.vouchers
  WHERE id = p_voucher_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Voucher not found';
  END IF;

  -- 2. Bearer identity check
  IF v.bearer_id IS NOT NULL AND v.bearer_id != p_user_id THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Voucher does not belong to this user.';
  END IF;

  -- 3. Status check
  IF v.status != 'available' THEN
    RAISE EXCEPTION 'INVALID: Voucher is not available (status: %)', v.status;
  END IF;

  -- 4. Expiry check
  IF v.expires_at IS NOT NULL AND v.expires_at < now() THEN
    UPDATE rewards.vouchers SET status = 'expired' WHERE id = p_voucher_id;
    RAISE EXCEPTION 'EXPIRED: Voucher has expired.';
  END IF;

  -- 5. Fetch reward item
  SELECT * INTO ri FROM rewards.reward_items WHERE id = v.reward_item_id;

  -- 6. Execute activation handler logic (simplified for now - just returns the config or code)
  IF ri.activation_type = 'external_code' THEN
    v_result := jsonb_build_object('code', v.code);
  ELSE
    v_result := ri.activation_config;
  END IF;

  -- 7. Mark voucher as redeemed
  UPDATE rewards.vouchers 
  SET status = 'redeemed', bearer_id = p_user_id, redeemed_at = now() 
  WHERE id = p_voucher_id;

  -- 8. Write immutable redemption record
  -- Note: We use the existing redemptions table but it might need columns.
  -- For now, we'll just insert what we have.
  INSERT INTO rewards.redemptions (voucher_id, user_id, redeemed_at)
  VALUES (p_voucher_id, p_user_id, now());

  -- If redemptions table had activation_result, we'd insert it here.
  -- Let's add it to redemptions table too.
  
  RETURN jsonb_build_object('success', true, 'type', ri.activation_type, 'result', v_result);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Add columns to redemptions
ALTER TABLE rewards.redemptions ADD COLUMN IF NOT EXISTS activation_type text;
ALTER TABLE rewards.redemptions ADD COLUMN IF NOT EXISTS activation_result jsonb;

-- Update the insert in redeem_voucher to include these
CREATE OR REPLACE FUNCTION rewards.redeem_voucher(p_voucher_id uuid, p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_vouc rewards.vouchers%ROWTYPE;
  v_ri rewards.reward_items%ROWTYPE;
  v_result jsonb;
BEGIN
  SELECT * INTO v_vouc FROM rewards.vouchers WHERE id = p_voucher_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Voucher not found'; END IF;
  IF v_vouc.bearer_id IS NOT NULL AND v_vouc.bearer_id != p_user_id THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;
  IF v_vouc.status != 'available' THEN RAISE EXCEPTION 'INVALID'; END IF;
  IF v_vouc.expires_at IS NOT NULL AND v_vouc.expires_at < now() THEN
    UPDATE rewards.vouchers SET status = 'expired' WHERE id = p_voucher_id;
    RAISE EXCEPTION 'EXPIRED';
  END IF;

  SELECT * INTO v_ri FROM rewards.reward_items WHERE id = v_vouc.reward_item_id;

  IF v_ri.activation_type = 'external_code' THEN
    v_result := jsonb_build_object('code', v_vouc.code);
  ELSE
    v_result := v_ri.activation_config;
  END IF;

  UPDATE rewards.vouchers SET status = 'redeemed', bearer_id = p_user_id, redeemed_at = now() WHERE id = p_voucher_id;

  INSERT INTO rewards.redemptions (voucher_id, user_id, redeemed_at, activation_type, activation_result)
  VALUES (p_voucher_id, p_user_id, now(), v_ri.activation_type, v_result);

  RETURN jsonb_build_object('success', true, 'type', v_ri.activation_type, 'result', v_result);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
