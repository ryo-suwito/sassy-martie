-- =============================================================================
-- A0 Foundation Test Suite (Robust)
-- Target: Agent A0 Migrations
-- =============================================================================

BEGIN;

-- 0. CLEANUP (Idempotency)
DELETE FROM auth.users WHERE id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003');
DELETE FROM catalog.listings WHERE id = '10000000-0000-0000-0000-000000000001';
DELETE FROM rewards.reward_items WHERE id = 'e0000000-0000-0000-0000-000000000001';

-- 1. SETUP: Mock data for testing
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'builder1@test.com', '{"username": "builder1", "role": "lister"}'),
  ('00000000-0000-0000-0000-000000000002', 'builder2@test.com', '{"username": "builder2", "role": "lister"}'),
  ('00000000-0000-0000-0000-000000000003', 'admin@test.com', '{"username": "admin", "role": "backoffice"}');

-- 2. TEST: Profile Auto-creation
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM builder.lister_profiles WHERE id = '00000000-0000-0000-0000-000000000001') THEN
    RAISE EXCEPTION 'Lister profile not auto-created for builder1';
  END IF;
  RAISE NOTICE 'Test 2: Profile Auto-creation PASSED';
END $$;

-- 3. TEST: Listing RLS (Simulation)
-- Create a listing for builder1
INSERT INTO catalog.listings (id, lister_id, slug, name, tagline, external_url, pricing_model, status)
VALUES ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'tool-1', 'Tool 1', 'Best tool', 'https://tool1.com', 'free', 'live');

-- 4. TEST: Badge Award Logic
-- Setup badge (ensure FULLY_FUNCTIONAL exists)
INSERT INTO trust.badges (code, display_name) 
VALUES ('FULLY_FUNCTIONAL', 'Fully Functional')
ON CONFLICT (code) DO NOTHING;

-- Create QA Run and Check
INSERT INTO trust.qa_runs (id, listing_id, triggered_by, overall_result)
VALUES ('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'manual', 'pending');

INSERT INTO trust.qa_checks (id, run_id, check_type, result, checked_at)
VALUES ('10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'functional', 'skip', now());

-- TRIGGER: Award badge on UPDATE to 'pass'
UPDATE trust.qa_checks SET result = 'pass' WHERE id = '10000000-0000-0000-0000-000000000003';

-- Verify badge was granted via trigger
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM trust.badge_grants WHERE listing_id = '10000000-0000-0000-0000-000000000001') THEN
    RAISE EXCEPTION 'Badge not granted on functional check UPDATE to pass';
  END IF;
  RAISE NOTICE 'Test 4: Badge Award Logic PASSED';
END $$;

-- 5. TEST: Badge Revoke Cascade
UPDATE catalog.listings SET qa_status = 'failing' WHERE id = '10000000-0000-0000-0000-000000000001';

-- Verify badge was revoked
DO $$
BEGIN
  IF (SELECT revoked_at FROM trust.badge_grants WHERE listing_id = '10000000-0000-0000-0000-000000000001') IS NULL THEN
    RAISE EXCEPTION 'Badge not revoked when listing qa_status became failing';
  END IF;
  RAISE NOTICE 'Test 5: Badge Revoke Cascade PASSED';
END $$;

-- 6. TEST: Taster Committee Quorum & Reputation
-- Seed config
INSERT INTO public.system_config (key, value) VALUES ('taste_quorum_minimum', '2'), ('taste_pass_threshold', '3.0')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Approved taster applications -> tasters
INSERT INTO community.taster_applications (applicant_id, motivation, status) VALUES 
  ('00000000-0000-0000-0000-000000000002', 'I love testing UX!', 'pending'),
  ('00000000-0000-0000-0000-000000000003', 'Expert in accessibility.', 'pending');

-- Update status to trigger taster creation
UPDATE community.taster_applications SET status = 'approved' WHERE applicant_id IN ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003');

-- Taste Check Run
INSERT INTO trust.qa_runs (id, listing_id, triggered_by, overall_result)
VALUES ('10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'manual', 'pending');

INSERT INTO trust.qa_checks (id, run_id, check_type, result, checked_at)
VALUES ('10000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000004', 'taste_test', 'skip', now());

-- Votes
INSERT INTO community.taste_votes (listing_id, taster_id, qa_run_id, score, rationale) VALUES 
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 5, 'Great UX!'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', 4, 'Solid.');

-- Verify verdict computed (avg = 4.5, threshold = 3.0)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM community.taste_verdicts WHERE qa_run_id = '10000000-0000-0000-0000-000000000004') THEN
     RAISE EXCEPTION 'Taste verdict not computed after quorum reached';
  END IF;

  IF (SELECT verdict FROM community.taste_verdicts WHERE qa_run_id = '10000000-0000-0000-0000-000000000004') != 'pass' THEN
    RAISE EXCEPTION 'Taste verdict result incorrect (expected pass)';
  END IF;
  
  -- Verify reputation gain (+0.1 since votes 5 and 4 are close to 4.5)
  IF (SELECT reputation_score FROM community.tasters WHERE id = '00000000-0000-0000-0000-000000000002') <= 0.0 THEN
    RAISE EXCEPTION 'Taster reputation not increased';
  END IF;
  RAISE NOTICE 'Test 6: Taster Committee Quorum & Reputation PASSED';
END $$;

-- 7. TEST: Voucher Atomic Redemption
INSERT INTO rewards.reward_items (id, name) VALUES ('e0000000-0000-0000-0000-000000000001', 'Beta Access');
INSERT INTO rewards.vouchers (id, reward_item_id, code, status) 
VALUES ('e1111111-1111-1111-1111-111111111111', 'e0000000-0000-0000-0000-000000000001', 'TEST-CODE', 'available');

-- Call function using SELECT
SELECT rewards.redeem_voucher('e1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001');

-- Verify redemption
DO $$
BEGIN
  IF (SELECT status FROM rewards.vouchers WHERE id = 'e1111111-1111-1111-1111-111111111111') != 'redeemed' THEN
    RAISE EXCEPTION 'Voucher redemption failed (status not redeemed)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM rewards.redemptions WHERE voucher_id = 'e1111111-1111-1111-1111-111111111111' AND user_id = '00000000-0000-0000-0000-000000000001') THEN
    RAISE EXCEPTION 'Redemption record missing';
  END IF;
  RAISE NOTICE 'Test 7: Voucher Atomic Redemption PASSED';
END $$;

ROLLBACK;
