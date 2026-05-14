-- =============================================================================
-- 004_trust_tables.sql
-- TRUST context: qa_runs, qa_checks, badges, badge_grants, grace_periods
-- The QA Engine. Trust is a state that decays and recovers over time.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- trust.qa_runs
-- One run = one complete evaluation cycle for a listing.
-- ---------------------------------------------------------------------------
CREATE TABLE trust.qa_runs (
  id             uuid                    PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id     uuid                    NOT NULL REFERENCES catalog.listings(id) ON DELETE CASCADE,
  triggered_by   public.qa_run_trigger   NOT NULL,
  initiated_at   timestamptz             NOT NULL DEFAULT now(),
  completed_at   timestamptz,
  overall_result public.qa_run_result    NOT NULL DEFAULT 'pending'
);

ALTER TABLE trust.qa_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust.qa_runs FORCE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- trust.qa_checks
-- One row per individual check within a run. Granular. Queryable.
-- ---------------------------------------------------------------------------
CREATE TABLE trust.qa_checks (
  id          uuid                 PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id      uuid                 NOT NULL REFERENCES trust.qa_runs(id) ON DELETE CASCADE,
  check_type  public.check_type    NOT NULL,
  result      public.check_result  NOT NULL,
  notes       text,
  checked_at  timestamptz          NOT NULL DEFAULT now()
);

ALTER TABLE trust.qa_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust.qa_checks FORCE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- trust.badges
-- Badge definition catalog. Small, static-ish table.
-- ---------------------------------------------------------------------------
CREATE TABLE trust.badges (
  id           uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  code         text  UNIQUE NOT NULL,
  display_name text  NOT NULL,
  description  text,
  icon_url     text
);

ALTER TABLE trust.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust.badges FORCE ROW LEVEL SECURITY;

-- Seed the canonical badge definitions
INSERT INTO trust.badges (code, display_name, description) VALUES
  ('FULLY_FUNCTIONAL',  'Fully Functional',  'The tool''s core workflow has been verified end-to-end by automated testing.'),
  ('SECURITY_VERIFIED', 'Security Verified',  'The tool passed an OWASP top-10 surface scan: SQL injection, XSS headers, HTTPS enforced.'),
  ('TASTE_APPROVED',    'Taste Approved',     'The Taster Committee reached quorum and approved this tool''s UX and value proposition.');

-- ---------------------------------------------------------------------------
-- trust.badge_grants
-- Active assignment of a badge to a listing. revoked_at IS NULL = active.
-- ---------------------------------------------------------------------------
CREATE TABLE trust.badge_grants (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  uuid        NOT NULL REFERENCES catalog.listings(id) ON DELETE CASCADE,
  badge_id    uuid        NOT NULL REFERENCES trust.badges(id) ON DELETE CASCADE,
  granted_at  timestamptz NOT NULL DEFAULT now(),
  revoked_at  timestamptz,
  revoked_by  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (listing_id, badge_id)
);

ALTER TABLE trust.badge_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust.badge_grants FORCE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- trust.grace_periods
-- The 48-hour operational state machine for tool health.
-- Badges are NOT immediately revoked. They enter a visual "warning" state.
-- ---------------------------------------------------------------------------
CREATE TABLE trust.grace_periods (
  id          uuid                            PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  uuid                            NOT NULL REFERENCES catalog.listings(id) ON DELETE CASCADE,
  qa_run_id   uuid                            NOT NULL REFERENCES trust.qa_runs(id) ON DELETE CASCADE,
  opened_at   timestamptz                     NOT NULL DEFAULT now(),
  deadline_at timestamptz                     NOT NULL DEFAULT now() + INTERVAL '48 hours',
  closed_at   timestamptz,
  resolution  public.grace_period_resolution,
  notes       text
);

ALTER TABLE trust.grace_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust.grace_periods FORCE ROW LEVEL SECURITY;
