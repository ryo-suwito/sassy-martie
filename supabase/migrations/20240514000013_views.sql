-- =============================================================================
-- 013_views.sql
-- Read models. Cross-context communication happens via views, not direct
-- cross-schema joins in application code.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- public.listing_trust_summary
-- Public-facing trust signal for a listing. Encapsulates join complexity.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.listing_trust_summary AS
SELECT
  l.id AS listing_id,
  l.qa_status,
  COALESCE(
    ARRAY_AGG(b.code) FILTER (WHERE bg.revoked_at IS NULL AND b.code IS NOT NULL),
    ARRAY[]::text[]
  ) AS active_badges,
  MAX(gp.deadline_at) FILTER (WHERE gp.closed_at IS NULL) AS active_grace_deadline
FROM catalog.listings l
LEFT JOIN trust.badge_grants bg ON bg.listing_id = l.id
LEFT JOIN trust.badges b ON b.id = bg.badge_id
LEFT JOIN trust.grace_periods gp ON gp.listing_id = l.id
GROUP BY l.id, l.qa_status;


-- ---------------------------------------------------------------------------
-- community.taster_wallet
-- Consolidated view of a Taster's community standing and voting stats.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW community.taster_wallet AS
SELECT
  t.id AS taster_id,
  t.status,
  t.vote_count,
  t.reputation_score,
  t.joined_at,
  COUNT(tv.id) AS verdicts_participated_in
FROM community.tasters t
LEFT JOIN community.taste_votes tv ON tv.taster_id = t.id
GROUP BY t.id;


-- ---------------------------------------------------------------------------
-- backoffice.work_queue
-- Aggregated dashboard view for backoffice operators.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW backoffice.work_queue AS
SELECT
  'pending_listing' AS task_type,
  id AS target_id,
  submitted_at AS created_at,
  'Listing needs initial review: ' || name AS description
FROM catalog.listings
WHERE status = 'pending_review'

UNION ALL

SELECT
  'open_flag' AS task_type,
  id AS target_id,
  created_at,
  'Listing flagged (' || severity::text || '): ' || reason AS description
FROM backoffice.flags
WHERE resolved_at IS NULL

UNION ALL

SELECT
  'pending_taster_app' AS task_type,
  id AS target_id,
  created_at,
  'Taster application pending review' AS description
FROM community.taster_applications
WHERE status = 'pending';
