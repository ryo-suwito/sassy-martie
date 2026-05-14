-- =============================================================================
-- 002_enums.sql
-- All enum types. Defined in public schema for cross-schema reuse.
-- No magic strings in application code or DB state machines.
-- =============================================================================

-- User identity
CREATE TYPE public.user_role AS ENUM ('user', 'lister', 'backoffice');

-- Catalog: listing lifecycle
CREATE TYPE public.pricing_model AS ENUM ('free', 'paid', 'freemium', 'contact');

CREATE TYPE public.listing_status AS ENUM (
  'draft',
  'pending_review',
  'live',
  'suspended'
);

-- Trust: QA engine states
CREATE TYPE public.qa_status AS ENUM (
  'unverified',
  'passing',
  'grace_period',
  'failing',
  'revoked'
);

CREATE TYPE public.qa_run_trigger AS ENUM ('scheduled', 'manual', 'resubmission');

CREATE TYPE public.qa_run_result AS ENUM ('pass', 'fail', 'pending');

CREATE TYPE public.check_type AS ENUM ('functional', 'security', 'taste_test');

CREATE TYPE public.check_result AS ENUM ('pass', 'fail', 'skip');

CREATE TYPE public.grace_period_resolution AS ENUM ('resolved', 'expired', 'revoked');

-- Catalog: editorial content
CREATE TYPE public.editorial_type AS ENUM ('review', 'deep_dive', 'news');

CREATE TYPE public.content_status AS ENUM ('draft', 'published', 'archived');

-- Backoffice
CREATE TYPE public.flag_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- Community: taster committee
CREATE TYPE public.taster_app_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE public.taster_status AS ENUM ('active', 'suspended', 'retired');

CREATE TYPE public.taste_verdict_result AS ENUM ('pass', 'fail');

-- Rewards
CREATE TYPE public.voucher_status AS ENUM ('available', 'reserved', 'redeemed', 'expired', 'revoked');
