-- =============================================================================
-- 016_a3_builder_extensions.sql
-- Extensions for Agent A3: Builder Dashboard
-- Adds missing fields for the 4-step submission wizard.
-- =============================================================================

-- Add missing columns to catalog.listings
ALTER TABLE catalog.listings 
  ADD COLUMN IF NOT EXISTS target_audience_description text;

-- Create catalog.listing_media
CREATE TABLE IF NOT EXISTS catalog.listing_media (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   uuid        NOT NULL REFERENCES catalog.listings(id) ON DELETE CASCADE,
  url          text        NOT NULL,
  type         text        NOT NULL DEFAULT 'screenshot', -- 'screenshot', 'logo', 'video'
  display_order int         NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE catalog.listing_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.listing_media FORCE ROW LEVEL SECURITY;

-- RLS for catalog.listing_media
-- Public read access
CREATE POLICY "Public read for listing_media" ON catalog.listing_media
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM catalog.listings l 
    WHERE l.id = catalog.listing_media.listing_id 
    AND l.status = 'live'
  ));

-- Owner full access
CREATE POLICY "Owner full access for listing_media" ON catalog.listing_media
  FOR ALL USING (EXISTS (
    SELECT 1 FROM catalog.listings l 
    WHERE l.id = catalog.listing_media.listing_id 
    AND l.lister_id = auth.uid()
  ));

-- Backoffice full access
CREATE POLICY "Backoffice full access for listing_media" ON catalog.listing_media
  FOR ALL USING ( (auth.jwt() ->> 'role') = 'backoffice' );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_listing_media_listing_id ON catalog.listing_media(listing_id);
