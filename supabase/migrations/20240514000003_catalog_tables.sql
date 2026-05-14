-- =============================================================================
-- 003_catalog_tables.sql  (revised)
-- CATALOG context: listings, utilities, editorials
--
-- NOTE: catalog.listings.lister_id FK to builder.lister_profiles is added
-- in 010_indexes.sql after the builder schema is created, to avoid forward
-- reference. The NOT NULL constraint is still enforced here.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- catalog.listings
-- External tools. Owned by a Builder (Lister). The anchor of the catalog.
-- ---------------------------------------------------------------------------
CREATE TABLE catalog.listings (
  id             uuid                  PRIMARY KEY DEFAULT gen_random_uuid(),
  lister_id      uuid                  NOT NULL,
  slug           text                  NOT NULL UNIQUE,
  name           text                  NOT NULL,
  tagline        text                  NOT NULL CHECK (char_length(tagline) <= 160),
  external_url   text                  NOT NULL,
  pricing_model  public.pricing_model  NOT NULL,
  status         public.listing_status NOT NULL DEFAULT 'draft',
  qa_status      public.qa_status      NOT NULL DEFAULT 'unverified',
  submitted_at   timestamptz,
  published_at   timestamptz,
  created_at     timestamptz           NOT NULL DEFAULT now(),
  updated_at     timestamptz           NOT NULL DEFAULT now()
);

ALTER TABLE catalog.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.listings FORCE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- catalog.utilities
-- Internal tools. Owned by the Martie org. Has runtime config, no external URL.
-- ---------------------------------------------------------------------------
CREATE TABLE catalog.utilities (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           text        NOT NULL UNIQUE,
  name           text        NOT NULL,
  description    text,
  runtime_config jsonb,
  is_active      boolean     NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE catalog.utilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.utilities FORCE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- catalog.editorials
-- Content artifacts. Always attached to a Listing via FK. Never free-floating.
-- ---------------------------------------------------------------------------
CREATE TABLE catalog.editorials (
  id           uuid                  PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   uuid                  NOT NULL REFERENCES catalog.listings(id) ON DELETE CASCADE,
  author_id    uuid                  REFERENCES auth.users(id) ON DELETE SET NULL,
  type         public.editorial_type NOT NULL,
  title        text                  NOT NULL,
  body_mdx     text                  NOT NULL,
  status       public.content_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at   timestamptz           NOT NULL DEFAULT now()
);

ALTER TABLE catalog.editorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.editorials FORCE ROW LEVEL SECURITY;
