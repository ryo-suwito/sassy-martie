-- =============================================================================
-- 006_backoffice_tables.sql
-- BACKOFFICE context: flags, audit_log
-- Command center. Escalation, god-mode ops, and the immutable ledger.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- backoffice.flags
-- Admin-initiated signals. A human judgment call.
-- ---------------------------------------------------------------------------
CREATE TABLE backoffice.flags (
  id           uuid                 PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   uuid                 NOT NULL REFERENCES catalog.listings(id) ON DELETE CASCADE,
  flagged_by   uuid                 NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason       text                 NOT NULL,
  severity     public.flag_severity NOT NULL,
  resolved_at  timestamptz,
  created_at   timestamptz          NOT NULL DEFAULT now()
);

ALTER TABLE backoffice.flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE backoffice.flags FORCE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- backoffice.audit_log
-- The immutable ledger. Insert-only. Never update. Never delete.
-- ---------------------------------------------------------------------------
CREATE TABLE backoffice.audit_log (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL, -- Null = system/automated ops
  action       text        NOT NULL, -- e.g. 'badge.revoke', 'grace_period.open'
  target_type  text        NOT NULL, -- e.g. 'listing', 'badge_grant'
  target_id    uuid,
  payload      jsonb,                -- Full before/after snapshot
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE backoffice.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE backoffice.audit_log FORCE ROW LEVEL SECURITY;
