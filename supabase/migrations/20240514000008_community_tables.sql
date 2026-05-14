-- =============================================================================
-- 008_community_tables.sql
-- COMMUNITY context: taster_applications, tasters, taste_votes, taste_verdicts
-- Community governance product. Tasters evaluate listings for the TASTE_APPROVED badge.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- community.taster_applications
-- A user's petition to join the committee.
-- ---------------------------------------------------------------------------
CREATE TABLE community.taster_applications (
  id               uuid                     PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id     uuid                     NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  motivation       text                     NOT NULL CHECK (char_length(motivation) <= 500),
  status           public.taster_app_status NOT NULL DEFAULT 'pending',
  reviewed_by      uuid                     REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at      timestamptz,
  rejection_reason text,
  created_at       timestamptz              NOT NULL DEFAULT now()
);

ALTER TABLE community.taster_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE community.taster_applications FORCE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- community.tasters
-- The approved committee members. 1:1 with auth.users.
-- ---------------------------------------------------------------------------
CREATE TABLE community.tasters (
  id               uuid                 PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id   uuid                 NOT NULL REFERENCES community.taster_applications(id) ON DELETE CASCADE,
  status           public.taster_status NOT NULL DEFAULT 'active',
  vote_count       integer              NOT NULL DEFAULT 0,
  reputation_score numeric(5,2)         NOT NULL DEFAULT 0.00,
  suspended_at     timestamptz,
  suspended_reason text,
  joined_at        timestamptz          NOT NULL DEFAULT now()
);

ALTER TABLE community.tasters ENABLE ROW LEVEL SECURITY;
ALTER TABLE community.tasters FORCE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- community.taste_votes
-- A single Taster's verdict on a specific listing.
-- ---------------------------------------------------------------------------
CREATE TABLE community.taste_votes (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid        NOT NULL REFERENCES catalog.listings(id) ON DELETE CASCADE,
  taster_id  uuid        NOT NULL REFERENCES community.tasters(id) ON DELETE CASCADE,
  qa_run_id  uuid        NOT NULL REFERENCES trust.qa_runs(id) ON DELETE CASCADE,
  score      integer     NOT NULL CHECK (score >= 1 AND score <= 5),
  rationale  text,
  voted_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (listing_id, taster_id, qa_run_id)
);

ALTER TABLE community.taste_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community.taste_votes FORCE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- community.taste_verdicts
-- The computed result of a voting round. Written by DB function.
-- ---------------------------------------------------------------------------
CREATE TABLE community.taste_verdicts (
  id                 uuid                        PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id         uuid                        NOT NULL REFERENCES catalog.listings(id) ON DELETE CASCADE,
  qa_run_id          uuid                        NOT NULL REFERENCES trust.qa_runs(id) ON DELETE CASCADE,
  quorum_reached_at  timestamptz                 NOT NULL DEFAULT now(),
  vote_count         integer                     NOT NULL,
  weighted_avg_score numeric(4,2)                NOT NULL,
  verdict            public.taste_verdict_result NOT NULL
);

ALTER TABLE community.taste_verdicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community.taste_verdicts FORCE ROW LEVEL SECURITY;
