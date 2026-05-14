-- =============================================================================
-- 009_system_config.sql
-- System-wide configuration. Key-Value table for operational parameters
-- like grace period hours, quorum minimums, etc.
-- =============================================================================

CREATE TABLE public.system_config (
  key        text        PRIMARY KEY,
  value      text        NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config FORCE ROW LEVEL SECURITY;
