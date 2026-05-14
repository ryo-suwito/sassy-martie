-- =============================================================================
-- 005_builder_tables.sql
-- BUILDER context: lister_profiles
-- The portfolio hub. One profile per builder. id is 1:1 with auth.users.
-- =============================================================================

CREATE TABLE builder.lister_profiles (
  id             uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username       text        NOT NULL UNIQUE,
  display_name   text,
  bio            text,
  website_url    text,
  twitter_handle text,
  avatar_url     text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE builder.lister_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder.lister_profiles FORCE ROW LEVEL SECURITY;

-- Now that builder.lister_profiles exists, wire the FK from catalog.listings
ALTER TABLE catalog.listings
  ADD CONSTRAINT listings_lister_id_fkey
  FOREIGN KEY (lister_id) REFERENCES builder.lister_profiles(id) ON DELETE CASCADE;
