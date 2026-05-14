# SassyMartie: The Voucher & Reward System

> Incentives are itemized. Vouchers are the general token.
> The system is a loyalty program, not a financial instrument.
> Non-transferability is not a rule enforced by code. It is a property guaranteed by schema.

---

## The Legal Boundary (Why This Design Exists)

A transferable, stored-value token is an **e-money instrument** in most jurisdictions.
That requires a financial license, AML compliance, and regulatory overhead that would kill the product.

The architectural response is simple: **make transfer physically impossible at the data layer.**
There is no transfer endpoint because there is no transfer operation in the schema.
If it can't be represented in data, it can't happen. No policy. No guardrail. Just structure.

---

## Core Design Principle: Bearer Binding

Every voucher is permanently bound to the user who earned it.
`bearer_id` is set once, on INSERT, via a `SECURITY DEFINER` function.
There is no UPDATE path for `bearer_id`. Ever.

```sql
-- The RLS policy says: you can only see and use your own vouchers.
-- There is no policy that allows any UPDATE on bearer_id.
-- Not for admins. Not for service_role via app code. Not for anyone.
-- The column is written once by the issuance function and never touched again.
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers FORCE ROW LEVEL SECURITY;

CREATE POLICY "bearer_read_own" ON vouchers
  FOR SELECT USING (bearer_id = auth.uid());

-- No UPDATE policy exists. The column cannot be changed through any channel.
```

This design means a Taster cannot "sell" their voucher, gift it, or transfer it.
The voucher is only redeemable by the user whose `auth.uid()` matches `bearer_id`.

---

## Schema: `rewards`

### `reward_items`
The catalog of what can be rewarded. Managed by backoffice. Extensible.

| Column            | Type         | Notes                                                        |
|-------------------|--------------|--------------------------------------------------------------|
| id                | uuid PK      |                                                              |
| code              | text UNIQUE NOT NULL | Internal identifier. e.g. `'FEATURE_CHOPPER_PRO'`     |
| display_name      | text NOT NULL | What the Taster sees. e.g. "Precision Chopper Pro Access"   |
| description       | text NOT NULL | One sentence. What does this actually give you?              |
| activation_type   | enum('feature_flag','access_grant','external_code','manual_fulfillment') NOT NULL | |
| activation_config | jsonb        | Type-specific config. See Activation Contracts below.        |
| is_active         | boolean NOT NULL DEFAULT true | Backoffice can retire rewards without deleting. |
| valid_days        | integer      | NULL = no expiry. Non-null = voucher expires N days after issuance. |
| created_at        | timestamptz NOT NULL DEFAULT now() |                                          |

**`activation_type` drives the redemption handler.** The application switches on this enum.
Adding a new reward type means adding a new handler, not changing the schema.

---

### `vouchers`
The issued token. The general entity that tokenizes the reward for a specific bearer.

| Column           | Type         | Notes                                                        |
|------------------|--------------|--------------------------------------------------------------|
| id               | uuid PK      |                                                              |
| bearer_id        | uuid NOT NULL FK → auth.users | **Immutable. Set once. Never updated.**      |
| reward_item_id   | uuid NOT NULL FK → reward_items |                                             |
| issued_by        | enum('system','backoffice') NOT NULL | Who issued this?                      |
| issued_reason    | text         | e.g. 'taste_vote_milestone_10', 'reputation_tier_2', 'manual_grant' |
| status           | enum('available','redeemed','expired','revoked') NOT NULL DEFAULT 'available' | |
| issued_at        | timestamptz NOT NULL DEFAULT now() |                                          |
| expires_at       | timestamptz  | Computed on insert: now() + reward_items.valid_days. NULL if no expiry. |
| redeemed_at      | timestamptz  | Set by the redeem function. NULL until claimed.              |

**Indexes:** `bearer_id`, `status`, `reward_item_id`

**The expiry sweep:** A `pg_cron` daily job sets `status = 'expired'` where 
`expires_at < now() AND status = 'available'`. Passive. No application involvement.

---

### `redemptions`
The immutable ledger of every redemption event. Mirrors `audit_log` philosophy.

| Column            | Type         | Notes                                                        |
|-------------------|--------------|--------------------------------------------------------------|
| id                | uuid PK      |                                                              |
| voucher_id        | uuid NOT NULL FK → vouchers |                                                |
| bearer_id         | uuid NOT NULL | Denormalized from vouchers. For fast identity verification.  |
| reward_item_id    | uuid NOT NULL | Denormalized. Snapshot of what was redeemed.                 |
| activation_type   | text NOT NULL | Snapshot of the handler used.                                |
| activation_result | jsonb        | What happened. Differs by type. See Activation Contracts.    |
| redeemed_at       | timestamptz NOT NULL DEFAULT now() |                                          |

**Insert-only. No updates. No deletes.** Dispute resolution lives here.

---

### `earn_policies`
What triggers automatic voucher issuance. Policy as data, not code.

| Column           | Type         | Notes                                                        |
|------------------|--------------|--------------------------------------------------------------|
| id               | uuid PK      |                                                              |
| trigger_event    | text NOT NULL | e.g. `'taster.vote_count.milestone'`, `'taster.reputation.tier'` |
| trigger_value    | integer      | e.g. `10` (10 votes), `2` (tier 2 reputation)               |
| reward_item_id   | uuid NOT NULL FK → reward_items | What voucher gets issued.                  |
| is_repeatable    | boolean NOT NULL DEFAULT false | Can the same user earn this multiple times? |
| is_active        | boolean NOT NULL DEFAULT true |                                              |

**How it works:** After every `taste_votes` INSERT, an Edge Function checks 
`earn_policies` against the Taster's current stats. If a policy is triggered and 
(`is_repeatable = true` OR the Taster hasn't earned this reward yet), 
a voucher is issued automatically via `issue_voucher(bearer_id, reward_item_id, reason)`.

---

## The Wallet: Read Model

```sql
CREATE VIEW taster_wallet AS
SELECT
  v.id,
  v.bearer_id,
  ri.display_name,
  ri.description,
  ri.activation_type,
  v.status,
  v.issued_at,
  v.expires_at,
  v.redeemed_at,
  CASE
    WHEN v.status = 'available' AND (v.expires_at IS NULL OR v.expires_at > now())
    THEN true ELSE false
  END AS is_redeemable
FROM vouchers v
JOIN reward_items ri ON ri.id = v.reward_item_id
WHERE v.bearer_id = auth.uid();  -- RLS-equivalent filter baked into the view
```

The UI queries this view. The component never touches raw voucher rows.

---

## The Redemption Function: The Only Path

There is exactly **one way** to redeem a voucher. A `SECURITY DEFINER` function.
The application calls this function. There is no direct UPDATE on `vouchers`.

```sql
CREATE OR REPLACE FUNCTION redeem_voucher(p_voucher_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v vouchers%ROWTYPE;
  ri reward_items%ROWTYPE;
  v_result jsonb;
BEGIN
  -- 1. Fetch and lock the voucher row
  SELECT * INTO v FROM vouchers
  WHERE id = p_voucher_id FOR UPDATE;

  -- 2. Bearer identity check (the legal wall)
  IF v.bearer_id != auth.uid() THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Voucher does not belong to this user.';
  END IF;

  -- 3. Status check
  IF v.status != 'available' THEN
    RAISE EXCEPTION 'INVALID: Voucher is not available (status: %)', v.status;
  END IF;

  -- 4. Expiry check
  IF v.expires_at IS NOT NULL AND v.expires_at < now() THEN
    UPDATE vouchers SET status = 'expired' WHERE id = p_voucher_id;
    RAISE EXCEPTION 'EXPIRED: Voucher has expired.';
  END IF;

  -- 5. Fetch reward item
  SELECT * INTO ri FROM reward_items WHERE id = v.reward_item_id;

  -- 6. Execute activation handler (type-specific)
  v_result := execute_activation_handler(ri.activation_type, ri.activation_config, v.bearer_id);

  -- 7. Mark voucher as redeemed
  UPDATE vouchers SET status = 'redeemed', redeemed_at = now() WHERE id = p_voucher_id;

  -- 8. Write immutable redemption record
  INSERT INTO redemptions (voucher_id, bearer_id, reward_item_id, activation_type, activation_result)
  VALUES (p_voucher_id, v.bearer_id, v.reward_item_id, ri.activation_type::text, v_result);

  RETURN jsonb_build_object('success', true, 'result', v_result);
END;
$$;
```

The `FOR UPDATE` lock prevents double-redemption in concurrent requests.
This is not an optimistic lock — it is a pessimistic lock on purpose. Vouchers cannot be race-conditioned.

---

## Activation Contracts (Per `activation_type`)

Each handler is a separate concern. Adding a new reward type = adding a new handler. Schema unchanged.

### `feature_flag`
```json
activation_config: { "flag_key": "chopper_pro_access" }
```
Handler: Sets `lister_profiles.feature_flags->>'chopper_pro_access' = 'true'`.
Result logged: `{ "flag_key": "chopper_pro_access", "granted_at": "<timestamp>" }`

### `access_grant`
```json
activation_config: { "access_table": "utility_access", "utility_id": "<uuid>" }
```
Handler: INSERTs a row into the specified access table granting the bearer access to a utility.
Result logged: `{ "access_id": "<new row uuid>" }`

### `external_code`
```json
activation_config: { "code_pool_id": "<uuid>" }
```
Handler: Pulls one unclaimed code from a `external_code_pool` table (WHERE `claimed_at IS NULL LIMIT 1 FOR UPDATE`), marks it claimed, returns the code to the bearer.
Result logged: `{ "code": "PARTNER-XXXX-YYYY" }` — shown once, never again.

### `manual_fulfillment`
```json
activation_config: { "fulfillment_instructions": "Grant 1 month of X subscription. Contact: ops@sassymartie.com" }
```
Handler: Creates a backoffice task in the work queue. No immediate automated action.
Result logged: `{ "task_id": "<uuid>", "status": "pending_fulfillment" }`
The Taster sees: "Your reward is being processed. Expect 24–48 hours."

---

## What Martie Manages

1. **Create/retire `reward_items`** — the reward catalog.
2. **Create/tune `earn_policies`** — what behavior earns what reward.
3. **Fulfill `manual_fulfillment` tasks** from the backoffice work queue.
4. **Revoke a voucher** (e.g., Taster suspended) — backoffice sets `status = 'revoked'`. Immutable once redeemed.
5. **Load `external_code_pool`** when adding partner deals.

Everything else is automated. The system self-operates at scale.
