-- =============================================================================
-- A5 Community & Rewards Test Suite
-- =============================================================================

BEGIN;

-- 1. SETUP: Mock data
INSERT INTO auth.users (id, email)
VALUES 
  ('a5555555-0000-0000-0000-000000000001', 'taster1@test.com'),
  ('a5555555-0000-0000-0000-000000000002', 'taster2@test.com');

INSERT INTO community.tasters (id, status, reputation_score, vote_count)
VALUES 
  ('a5555555-0000-0000-0000-000000000001', 'active', 1.0, 5);

INSERT INTO rewards.reward_items (id, name, code, activation_type, valid_days)
VALUES 
  ('a5555555-1111-1111-1111-000000000001', 'Pro Access', 'PRO_ACCESS', 'feature_flag', 30),
  ('a5555555-1111-1111-1111-000000000002', 'Partner Deal', 'PARTNER_DEAL', 'external_code', NULL);

INSERT INTO rewards.external_code_pool (reward_item_id, code)
VALUES 
  ('a5555555-1111-1111-1111-000000000002', 'PARTNER-123-ABC');

-- 2. TEST: issue_voucher (Internal Code)
DO $$
DECLARE
  v_voucher_id uuid;
BEGIN
  v_voucher_id := rewards.issue_voucher(
    'a5555555-0000-0000-0000-000000000001',
    'a5555555-1111-1111-1111-000000000001',
    'milestone_5_votes'
  );

  IF NOT EXISTS (SELECT 1 FROM rewards.vouchers WHERE id = v_voucher_id AND bearer_id = 'a5555555-0000-0000-0000-000000000001') THEN
    RAISE EXCEPTION 'Voucher not issued correctly';
  END IF;

  IF (SELECT code FROM rewards.vouchers WHERE id = v_voucher_id) NOT LIKE 'MARTIE-%' THEN
    RAISE EXCEPTION 'Internal voucher code format incorrect';
  END IF;

  RAISE NOTICE 'Test 2: issue_voucher (Internal) PASSED';
END $$;

-- 3. TEST: issue_voucher (External Code from Pool)
DO $$
DECLARE
  v_voucher_id uuid;
BEGIN
  v_voucher_id := rewards.issue_voucher(
    'a5555555-0000-0000-0000-000000000001',
    'a5555555-1111-1111-1111-000000000002',
    'reputation_tier_1'
  );

  IF (SELECT code FROM rewards.vouchers WHERE id = v_voucher_id) != 'PARTNER-123-ABC' THEN
    RAISE EXCEPTION 'External voucher code not pulled from pool correctly';
  END IF;

  IF (SELECT is_allocated FROM rewards.external_code_pool WHERE code = 'PARTNER-123-ABC') != true THEN
    RAISE EXCEPTION 'External code not marked as allocated in pool';
  END IF;

  RAISE NOTICE 'Test 3: issue_voucher (External) PASSED';
END $$;

-- 4. TEST: redeem_voucher (Success)
DO $$
DECLARE
  v_voucher_id uuid;
  v_result jsonb;
BEGIN
  -- Create available voucher
  INSERT INTO rewards.vouchers (reward_item_id, bearer_id, status, code)
  VALUES ('a5555555-1111-1111-1111-000000000001', 'a5555555-0000-0000-0000-000000000001', 'available', 'REDEEM-ME')
  RETURNING id INTO v_voucher_id;

  v_result := rewards.redeem_voucher(v_voucher_id, 'a5555555-0000-0000-0000-000000000001');

  IF (v_result->>'success') != 'true' THEN
    RAISE EXCEPTION 'Redemption returned failure';
  END IF;

  IF (SELECT status FROM rewards.vouchers WHERE id = v_voucher_id) != 'redeemed' THEN
    RAISE EXCEPTION 'Voucher status not updated to redeemed';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM rewards.redemptions WHERE voucher_id = v_voucher_id AND activation_type = 'feature_flag') THEN
    RAISE EXCEPTION 'Redemption record with metadata not created';
  END IF;

  RAISE NOTICE 'Test 4: redeem_voucher (Success) PASSED';
END $$;

-- 5. TEST: redeem_voucher (Unauthorized)
DO $$
DECLARE
  v_voucher_id uuid;
BEGIN
  INSERT INTO rewards.vouchers (reward_item_id, bearer_id, status, code)
  VALUES ('a5555555-1111-1111-1111-000000000001', 'a5555555-0000-0000-0000-000000000001', 'available', 'UNAUTH-CODE')
  RETURNING id INTO v_voucher_id;

  BEGIN
    PERFORM rewards.redeem_voucher(v_voucher_id, 'a5555555-0000-0000-0000-000000000002');
    RAISE EXCEPTION 'Redemption should have failed for wrong bearer';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%UNAUTHORIZED%' THEN
      RAISE EXCEPTION 'Wrong error message for unauthorized redemption: %', SQLERRM;
    END IF;
  END;

  RAISE NOTICE 'Test 5: redeem_voucher (Unauthorized) PASSED';
END $$;

-- 6. TEST: voucher_wallet view
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM rewards.voucher_wallet WHERE bearer_id = 'a5555555-0000-0000-0000-000000000001') THEN
    RAISE EXCEPTION 'Voucher wallet view is empty or filtered incorrectly';
  END IF;

  IF (SELECT COUNT(*) FROM rewards.voucher_wallet WHERE bearer_id = 'a5555555-0000-0000-0000-000000000001') < 3 THEN
    RAISE EXCEPTION 'Voucher wallet view missing entries';
  END IF;

  RAISE NOTICE 'Test 6: voucher_wallet view PASSED';
END $$;

ROLLBACK;
