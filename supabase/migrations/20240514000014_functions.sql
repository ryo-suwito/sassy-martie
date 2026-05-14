-- =============================================================================
-- 014_functions.sql
-- Database functions containing core business logic.
-- SECURITY DEFINER functions act as elevated, bounded operations.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- rewards.redeem_voucher
-- Claiming a reward. Atomically locks the voucher to the user.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION rewards.redeem_voucher(p_voucher_id uuid, p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  v_status public.voucher_status;
  v_bearer_id uuid;
BEGIN
  -- Row-level lock to prevent race conditions on redemption
  SELECT status, bearer_id INTO v_status, v_bearer_id
  FROM rewards.vouchers
  WHERE id = p_voucher_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Voucher not found';
  END IF;

  IF v_status != 'available' THEN
    RAISE EXCEPTION 'Voucher is not available (status: %)', v_status;
  END IF;

  IF v_bearer_id IS NOT NULL THEN
    RAISE EXCEPTION 'Voucher already claimed';
  END IF;

  -- Claim the voucher
  UPDATE rewards.vouchers
  SET status = 'redeemed', bearer_id = p_user_id
  WHERE id = p_voucher_id;

  -- Record redemption
  INSERT INTO rewards.redemptions (voucher_id, user_id)
  VALUES (p_voucher_id, p_user_id);

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ---------------------------------------------------------------------------
-- trust.award_badge_if_eligible
-- Triggered by QA Check pass. Checks if a badge mapping exists and grants it.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trust.award_badge_if_eligible(p_listing_id uuid, p_check_type public.check_type)
RETURNS void AS $$
DECLARE
  v_badge_code text;
  v_badge_id uuid;
BEGIN
  -- Map check type to badge code
  CASE p_check_type
    WHEN 'functional' THEN v_badge_code := 'FULLY_FUNCTIONAL';
    WHEN 'security' THEN v_badge_code := 'SECURITY_VERIFIED';
    WHEN 'taste_test' THEN v_badge_code := 'TASTE_APPROVED';
    ELSE RETURN; -- No badge for this check type
  END CASE;

  -- Get badge ID
  SELECT id INTO v_badge_id FROM trust.badges WHERE code = v_badge_code;
  
  IF FOUND THEN
    -- Insert grant, ignoring if already active
    INSERT INTO trust.badge_grants (listing_id, badge_id)
    VALUES (p_listing_id, v_badge_id)
    ON CONFLICT (listing_id, badge_id) 
    DO UPDATE SET revoked_at = NULL, revoked_by = NULL -- Reactivate if previously revoked
    WHERE trust.badge_grants.revoked_at IS NOT NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call award_badge_if_eligible
CREATE OR REPLACE FUNCTION trust.trigger_award_badge()
RETURNS TRIGGER AS $$
DECLARE
  v_listing_id uuid;
BEGIN
  IF NEW.result = 'pass' THEN
    SELECT listing_id INTO v_listing_id FROM trust.qa_runs WHERE id = NEW.run_id;
    PERFORM trust.award_badge_if_eligible(v_listing_id, NEW.check_type);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_qa_check_pass_award_badge
  AFTER UPDATE ON trust.qa_checks
  FOR EACH ROW EXECUTE PROCEDURE trust.trigger_award_badge();


-- ---------------------------------------------------------------------------
-- community.compute_taste_verdict
-- Computes weighted average and records the verdict. Called by check_and_compute.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION community.compute_taste_verdict(p_qa_run_id uuid)
RETURNS void AS $$
DECLARE
  v_listing_id uuid;
  v_vote_count integer;
  v_total_weighted_score numeric;
  v_total_weight numeric;
  v_avg_score numeric(4,2);
  v_verdict public.taste_verdict_result;
  v_threshold numeric;
BEGIN
  -- Get context
  SELECT listing_id INTO v_listing_id FROM trust.qa_runs WHERE id = p_qa_run_id;
  SELECT value::numeric INTO v_threshold FROM public.system_config WHERE key = 'taste_pass_threshold';

  -- Compute weighted sum
  SELECT 
    COUNT(*),
    SUM(tv.score * GREATEST(t.reputation_score, 0.1)), -- Base weight 0.1 for new tasters
    SUM(GREATEST(t.reputation_score, 0.1))
  INTO v_vote_count, v_total_weighted_score, v_total_weight
  FROM community.taste_votes tv
  JOIN community.tasters t ON t.id = tv.taster_id
  WHERE tv.qa_run_id = p_qa_run_id;

  IF v_vote_count = 0 THEN RETURN; END IF;

  v_avg_score := (v_total_weighted_score / v_total_weight)::numeric(4,2);
  
  IF v_avg_score >= v_threshold THEN
    v_verdict := 'pass';
  ELSE
    v_verdict := 'fail';
  END IF;

  -- Record verdict
  INSERT INTO community.taste_verdicts (listing_id, qa_run_id, vote_count, weighted_avg_score, verdict)
  VALUES (v_listing_id, p_qa_run_id, v_vote_count, v_avg_score, v_verdict);

  -- Update QA Check
  UPDATE trust.qa_checks 
  SET result = v_verdict::text::public.check_result
  WHERE run_id = p_qa_run_id AND check_type = 'taste_test';
  
  -- Update Taster Reputations (Simplified logic per spec)
  -- +0.1 if within 0.5 of avg, -0.05 if outside 1.0
  UPDATE community.tasters t
  SET 
    reputation_score = GREATEST(0, reputation_score + 
      CASE 
        WHEN abs(tv.score - v_avg_score) <= 0.5 THEN 0.1
        WHEN abs(tv.score - v_avg_score) > 1.0 THEN -0.05
        ELSE 0 
      END
    ),
    vote_count = vote_count + 1
  FROM community.taste_votes tv
  WHERE tv.qa_run_id = p_qa_run_id AND tv.taster_id = t.id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ---------------------------------------------------------------------------
-- community.check_and_compute_taste_verdict
-- Trigger wrapper checking quorum before computation.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION community.check_and_compute_taste_verdict()
RETURNS TRIGGER AS $$
DECLARE
  v_quorum_min integer;
  v_current_votes integer;
  v_verdict_exists boolean;
BEGIN
  -- Check if verdict already computed (prevent double compute)
  SELECT EXISTS(SELECT 1 FROM community.taste_verdicts WHERE qa_run_id = NEW.qa_run_id) INTO v_verdict_exists;
  IF v_verdict_exists THEN RETURN NEW; END IF;

  -- Check quorum
  SELECT value::integer INTO v_quorum_min FROM public.system_config WHERE key = 'taste_quorum_minimum';
  SELECT COUNT(*) INTO v_current_votes FROM community.taste_votes WHERE qa_run_id = NEW.qa_run_id;

  IF v_current_votes >= v_quorum_min THEN
    PERFORM community.compute_taste_verdict(NEW.qa_run_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_taste_vote_check_quorum
  AFTER INSERT ON community.taste_votes
  FOR EACH ROW EXECUTE PROCEDURE community.check_and_compute_taste_verdict();
