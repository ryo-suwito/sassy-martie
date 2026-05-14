-- Update backoffice.work_queue to include all priority tiers from 04_BACKOFFICE_COMMAND_CENTER.md

CREATE OR REPLACE VIEW backoffice.work_queue AS
-- Priority 1: Expiring Soon (Grace periods expiring within 6 hours)
SELECT
  'expiring_grace_period' AS task_type,
  id AS target_id,
  deadline_at AS created_at,
  'Grace period expiring soon for listing ' || listing_id AS description
FROM trust.grace_periods
WHERE closed_at IS NULL AND deadline_at < now() + INTERVAL '6 hours'

UNION ALL

-- Priority 2: Human Review Needed (Taste checks pending human vote)
-- Note: Phase 1 might be empty but we include the query.
SELECT
  'pending_taste_test' AS task_type,
  id AS target_id,
  checked_at AS created_at,
  'Taste check pending review for run ' || run_id AS description
FROM trust.qa_checks
WHERE check_type = 'taste_test' AND result = 'skip' -- Actually, specs say result = 'pending' but schema uses 'pass'|'fail'|'skip'
-- Wait, let me check qa_checks.result enum again.
-- Database says: "pass" | "fail" | "skip"
-- 04_BACKOFFICE_COMMAND_CENTER.md says result = 'pending'
-- 02_QA_ENGINE_STATE_MACHINE.md says 'pending' is an overall_result, but qa_checks has 'pass'|'fail'|'skip'.
-- Taste tests in Phase 1 time out to 'skip'.
-- Let's stick to what's in the DB for now. If it's skip, maybe it needs review?
-- Actually, Priority 2 says "qa_checks WHERE check_type = 'taste_test' AND result = 'pending'"
-- But 'pending' is NOT in the check_result enum in database.types.ts.
-- Maybe it should be 'skip' or we need to add 'pending' to the enum.
-- Let's re-read 02_QA_ENGINE_STATE_MACHINE.md:
-- "taste_test result = 'skip'" when quorum never reached.
-- Let's use 'skip' as a proxy for "needs human eyes if we want to manually verdict it".

UNION ALL

-- Priority 3: Newly Submitted
SELECT
  'pending_listing' AS task_type,
  id AS target_id,
  submitted_at AS created_at,
  'New listing submission: ' || name AS description
FROM catalog.listings
WHERE status = 'pending_review'

UNION ALL

-- Priority 4: Flagged
SELECT
  'open_flag' AS task_type,
  id AS target_id,
  created_at,
  'Unresolved flag (' || severity::text || '): ' || reason AS description
FROM backoffice.flags
WHERE resolved_at IS NULL

UNION ALL

-- Priority 5: Taster Applications
SELECT
  'pending_taster_app' AS task_type,
  id AS target_id,
  created_at,
  'Taster application pending review' AS description
FROM community.taster_applications
WHERE status = 'pending';

