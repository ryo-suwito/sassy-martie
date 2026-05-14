-- =============================================================================
-- 007_rewards_tables.sql
-- REWARDS context: reward_items, vouchers, redemptions, earn_policies, external_code_pool
-- =============================================================================

-- ---------------------------------------------------------------------------
-- rewards.reward_items
-- Catalog of available rewards (e.g., "$10 AWS Credit", "Martie Sticker").
-- ---------------------------------------------------------------------------
CREATE TABLE rewards.reward_items (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text        NOT NULL,
  description  text,
  cost_points  integer     NOT NULL DEFAULT 0, -- Reputation/points cost
  is_active    boolean     NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rewards.reward_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards.reward_items FORCE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- rewards.vouchers
-- The core voucher entity.
-- CRITICAL RULE: bearer_id is write-once (enforced via RLS).
-- ---------------------------------------------------------------------------
CREATE TABLE rewards.vouchers (
  id              uuid                  PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_item_id  uuid                  NOT NULL REFERENCES rewards.reward_items(id) ON DELETE CASCADE,
  bearer_id       uuid                  REFERENCES auth.users(id) ON DELETE SET NULL, -- Null until claimed
  status          public.voucher_status NOT NULL DEFAULT 'available',
  code            text                  NOT NULL UNIQUE, -- The actual secret code
  expires_at      timestamptz,
  created_at      timestamptz           NOT NULL DEFAULT now()
);

ALTER TABLE rewards.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards.vouchers FORCE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- rewards.redemptions
-- Record of a voucher being used.
-- ---------------------------------------------------------------------------
CREATE TABLE rewards.redemptions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id  uuid        NOT NULL REFERENCES rewards.vouchers(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redeemed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rewards.redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards.redemptions FORCE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- rewards.earn_policies
-- Rules for how points/reputation map to reward eligibility.
-- ---------------------------------------------------------------------------
CREATE TABLE rewards.earn_policies (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text        NOT NULL UNIQUE, -- e.g., 'taste_vote', 'referral'
  points      integer     NOT NULL,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rewards.earn_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards.earn_policies FORCE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- rewards.external_code_pool
-- Pre-generated codes imported from external partners (AWS, Stripe, etc).
-- ---------------------------------------------------------------------------
CREATE TABLE rewards.external_code_pool (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_item_id uuid        NOT NULL REFERENCES rewards.reward_items(id) ON DELETE CASCADE,
  code           text        NOT NULL UNIQUE,
  is_allocated   boolean     NOT NULL DEFAULT false, -- True once assigned to a voucher
  imported_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rewards.external_code_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards.external_code_pool FORCE ROW LEVEL SECURITY;
