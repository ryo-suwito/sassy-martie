-- =============================================================================
-- 001_schemas.sql
-- Create all bounded-context schemas.
-- Every other migration depends on these schemas existing.
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS catalog;
CREATE SCHEMA IF NOT EXISTS trust;
CREATE SCHEMA IF NOT EXISTS builder;
CREATE SCHEMA IF NOT EXISTS backoffice;
CREATE SCHEMA IF NOT EXISTS rewards;
CREATE SCHEMA IF NOT EXISTS community;
