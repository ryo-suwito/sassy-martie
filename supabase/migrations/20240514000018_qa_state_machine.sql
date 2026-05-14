-- =============================================================================
-- 018_qa_state_machine.sql
-- State machine transitions and cron schedules for the QA Engine.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. QA Run Completion & State Transition
-- ---------------------------------------------------------------------------

-- Check if a QA run is complete (all 3 checks done)
CREATE OR REPLACE FUNCTION trust.check_qa_run_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_check_count integer;
  v_fail_count integer;
  v_listing_id uuid;
  v_overall_result public.qa_run_result;
BEGIN
  -- Count checks for this run
  SELECT COUNT(*) INTO v_check_count FROM trust.qa_checks WHERE run_id = NEW.run_id;
  
  -- We expect exactly 3 checks: functional, security, taste_test
  IF v_check_count >= 3 THEN
    -- Check for failures
    SELECT COUNT(*) INTO v_fail_count FROM trust.qa_checks WHERE run_id = NEW.run_id AND result = 'fail';
    
    IF v_fail_count > 0 THEN
      v_overall_result := 'fail';
    ELSE
      v_overall_result := 'pass';
    END IF;

    -- Update the run
    UPDATE trust.qa_runs 
    SET overall_result = v_overall_result, completed_at = now() 
    WHERE id = NEW.run_id AND overall_result = 'pending';

    -- Trigger listing state transition
    SELECT listing_id INTO v_listing_id FROM trust.qa_runs WHERE id = NEW.run_id;
    
    IF v_overall_result = 'pass' THEN
      UPDATE catalog.listings SET qa_status = 'passing' WHERE id = v_listing_id;
      
      -- If there was an open grace period, close it
      UPDATE trust.grace_periods 
      SET closed_at = now(), resolution = 'resolved' 
      WHERE listing_id = v_listing_id AND closed_at IS NULL;
      
    ELSIF v_overall_result = 'fail' THEN
      -- Start grace period
      UPDATE catalog.listings SET qa_status = 'grace_period' WHERE id = v_listing_id;
      
      -- Only insert if not already in an open grace period
      IF NOT EXISTS (SELECT 1 FROM trust.grace_periods WHERE listing_id = v_listing_id AND closed_at IS NULL) THEN
        INSERT INTO trust.grace_periods (listing_id, qa_run_id, deadline_at, notes)
        VALUES (
          v_listing_id, 
          NEW.run_id, 
          now() + INTERVAL '48 hours', 
          'Automated QA run failed. Fix identified issues to retain badges.'
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_qa_check_complete_transition_state
  AFTER INSERT OR UPDATE ON trust.qa_checks
  FOR EACH ROW EXECUTE PROCEDURE trust.check_qa_run_completion();

-- ---------------------------------------------------------------------------
-- 2. Cron Schedules (Requires pg_cron extension)
-- ---------------------------------------------------------------------------

-- We use a wrapper function to call Edge Functions via HTTP
-- This assumes the net extension or similar is available, or we use a more standard 
-- approach like calling a webhook URL.
-- In Supabase, we can use `http_post` if `pgsql-http` is enabled.

/*
-- Example pg_cron setup (uncomment if extensions are ready)
SELECT cron.schedule('qa-batch-trigger', '0 3 * * 1', $$
  SELECT net.http_post(
    url := 'https://' || (SELECT value FROM public.system_config WHERE key = 'supabase_project_ref') || '.supabase.co/functions/v1/qa-trigger-batch',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || (SELECT value FROM public.system_config WHERE key = 'supabase_service_role_key'))
  );
$$);

SELECT cron.schedule('grace-period-enforcer', '0 0 * * *', $$
  SELECT net.http_post(
    url := 'https://' || (SELECT value FROM public.system_config WHERE key = 'supabase_project_ref') || '.supabase.co/functions/v1/qa-grace-period-enforcer',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || (SELECT value FROM public.system_config WHERE key = 'supabase_service_role_key'))
  );
$$);
*/
