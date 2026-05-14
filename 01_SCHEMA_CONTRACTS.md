# SassyMartie: Database Schema Contracts

> The schema is the truth. Application code is downstream of it.
> Every design decision here maps directly to a Problem Statement.

---

## Guiding Principles

1. **RLS is the wall, not the application filter.** Every table is locked by default.
2. **No polymorphic type columns** as a substitute for proper table separation.
3. **Enums over magic strings.** State machines live in the DB, not in application switch statements.
4. **Audit trails are non-negotiable.** Insert-only `audit_log` table. Never update it.
5. **Every RLS-filtered column is indexed.** No exceptions.

---

## Schema: `catalog`

### `listings`
Addresses: Problem #1 (Taxonomy) + Problem #3 (Builder Portfolio anchor point)

| Column             | Type                   | Notes                                          |
|--------------------|------------------------|------------------------------------------------|
| id                 | uuid PK                | gen_random_uuid()                              |
| lister_id          | uuid FK → lister_profiles | Owner. RLS anchor.                          |
| slug               | text UNIQUE NOT NULL   | URL-safe identifier. Immutable after publish.  |
| name               | text NOT NULL          |                                                |
| tagline            | text NOT NULL          | Max 160 chars. SEO meta description source.    |
| external_url       | text NOT NULL          |                                                |
| pricing_model      | enum('free','paid','freemium','contact') NOT NULL |                         |
| status             | enum('draft','pending_review','live','suspended') NOT NULL DEFAULT 'draft' |   |
| qa_status          | enum('unverified','passing','grace_period','failing','revoked') NOT NULL DEFAULT 'unverified' | |
| submitted_at       | timestamptz            |                                                |
| published_at       | timestamptz            |                                                |
| created_at         | timestamptz NOT NULL   | DEFAULT now()                                  |
| updated_at         | timestamptz NOT NULL   | Managed by trigger.                            |

**Indexes:** `lister_id`, `slug`, `status`, `qa_status`  
**RLS:** Builders see only their own rows. Public sees only `status = 'live'` rows. Backoffice sees all.

---

### `utilities`
Addresses: Problem #1 (Taxonomy Chaos — internal tools are NOT listings)

| Column         | Type       | Notes                                                     |
|----------------|------------|-----------------------------------------------------------|
| id             | uuid PK    |                                                           |
| slug           | text UNIQUE NOT NULL | Routes to an internal Next.js route, not external URL. |
| name           | text NOT NULL |                                                        |
| description    | text       |                                                           |
| runtime_config | jsonb      | Tool-specific config. Validated by app layer via Zod.     |
| is_active      | boolean    | DEFAULT true                                              |
| created_at     | timestamptz |                                                          |

**RLS:** Public read. No public write. Backoffice-only mutations.

---

### `editorials`
Addresses: Problem #1 — Editorial is content *attached to* a Listing, not a Listing.

| Column         | Type           | Notes                                        |
|----------------|----------------|----------------------------------------------|
| id             | uuid PK        |                                              |
| listing_id     | uuid FK → listings NOT NULL | A review cannot exist without a tool. |
| author_id      | uuid FK → auth.users |                                        |
| type           | enum('review','deep_dive','news') NOT NULL |                        |
| title          | text NOT NULL  |                                              |
| body_mdx       | text NOT NULL  | Stored as MDX. Rendered server-side.         |
| status         | enum('draft','published','archived') NOT NULL DEFAULT 'draft' |       |
| published_at   | timestamptz    |                                              |
| created_at     | timestamptz NOT NULL |                                        |

**Indexes:** `listing_id`, `author_id`, `status`  
**RLS:** Public sees published only. Authors see their own. Backoffice sees all.

---

## Schema: `trust`

### `qa_runs`
Addresses: Problem #2 (Trust Deficit) — The QA Engine. One run = one complete evaluation cycle.

| Column         | Type         | Notes                                              |
|----------------|--------------|----------------------------------------------------|
| id             | uuid PK      |                                                    |
| listing_id     | uuid FK → listings NOT NULL |                                       |
| triggered_by   | enum('scheduled','manual','resubmission') NOT NULL |                    |
| initiated_at   | timestamptz NOT NULL |                                            |
| completed_at   | timestamptz  |                                                    |
| overall_result | enum('pass','fail','pending') NOT NULL DEFAULT 'pending' |              |

---

### `qa_checks`
One row per individual check within a run. Granular. Queryable.

| Column         | Type       | Notes                                                 |
|----------------|------------|-------------------------------------------------------|
| id             | uuid PK    |                                                       |
| run_id         | uuid FK → qa_runs NOT NULL |                                         |
| check_type     | enum('functional','security','taste_test') NOT NULL |                  |
| result         | enum('pass','fail','skip') NOT NULL |                              |
| notes          | text       | Human-readable finding. Surfaced to builder on fail.  |
| checked_at     | timestamptz NOT NULL |                                               |

---

### `badges`
The badge *definition* catalog. Small, static-ish table.

| Column       | Type       | Notes                                                   |
|--------------|------------|---------------------------------------------------------|
| id           | uuid PK    |                                                         |
| code         | text UNIQUE | e.g. 'SECURITY_VERIFIED', 'FULLY_FUNCTIONAL'           |
| display_name | text       |                                                         |
| description  | text       |                                                         |
| icon_url     | text       |                                                         |

---

### `badge_grants`
The *active assignment* of a badge to a listing. Many-to-many with temporal validity.

| Column       | Type         | Notes                                                  |
|--------------|--------------|--------------------------------------------------------|
| id           | uuid PK      |                                                        |
| listing_id   | uuid FK → listings NOT NULL |                                           |
| badge_id     | uuid FK → badges NOT NULL |                                             |
| granted_at   | timestamptz NOT NULL |                                                  |
| revoked_at   | timestamptz  | NULL means active. Soft-delete pattern.                |
| revoked_by   | uuid FK → auth.users | Backoffice actor.                              |

**Critical:** A badge is only "active" when `revoked_at IS NULL`. This is a query contract, 
enforced by a DB view: `active_badge_grants`.

---

### `grace_periods`
Addresses: Problem #2 + Problem #4. The operational state machine for tool health.

| Column          | Type         | Notes                                             |
|-----------------|--------------|---------------------------------------------------|
| id              | uuid PK      |                                                   |
| listing_id      | uuid FK → listings NOT NULL |                                      |
| qa_run_id       | uuid FK → qa_runs NOT NULL | The failing run that triggered this.    |
| opened_at       | timestamptz NOT NULL DEFAULT now() |                               |
| deadline_at     | timestamptz NOT NULL | DEFAULT now() + INTERVAL '48 hours'           |
| closed_at       | timestamptz  | NULL = grace period is active.                    |
| resolution      | enum('resolved','expired','revoked') | Set on close.              |
| notes           | text         | Backoffice notes for builder communication.       |

---

## Schema: `builder`

### `lister_profiles`
Addresses: Problem #3 (Fragmented Portfolio). One profile per builder. The portfolio hub.

| Column          | Type       | Notes                                              |
|-----------------|------------|----------------------------------------------------|
| id              | uuid PK FK → auth.users | 1:1 with auth user. No separate UUID.    |
| username        | text UNIQUE NOT NULL | Public-facing handle.                      |
| display_name    | text       |                                                    |
| bio             | text       |                                                    |
| website_url     | text       |                                                    |
| twitter_handle  | text       |                                                    |
| avatar_url      | text       |                                                    |
| created_at      | timestamptz |                                                   |

**RLS:** Public read. Owner write only. Backoffice full access.

---

## Schema: `backoffice`

### `flags`
Addresses: Problem #4. Admin-initiated signals. Not a QA run. A human judgment call.

| Column       | Type       | Notes                                                   |
|--------------|------------|---------------------------------------------------------|
| id           | uuid PK    |                                                         |
| listing_id   | uuid FK → listings NOT NULL |                                            |
| flagged_by   | uuid FK → auth.users NOT NULL | Backoffice actor.                      |
| reason       | text NOT NULL |                                                      |
| severity     | enum('low','medium','high','critical') NOT NULL |                        |
| resolved_at  | timestamptz |                                                        |
| created_at   | timestamptz NOT NULL |                                                   |

---

### `audit_log`
The immutable ledger. Addresses: Problem #4 (operational accountability at scale).

| Column       | Type         | Notes                                                 |
|--------------|--------------|-------------------------------------------------------|
| id           | uuid PK      |                                                       |
| actor_id     | uuid         | auth.users.id. Can be system (null for automated ops) |
| action       | text NOT NULL | e.g. 'badge.revoke', 'grace_period.open'             |
| target_type  | text NOT NULL | e.g. 'listing', 'badge_grant'                        |
| target_id    | uuid         |                                                       |
| payload      | jsonb        | Full before/after snapshot.                           |
| created_at   | timestamptz NOT NULL DEFAULT now() |                               |

**RLS:** Insert-only for service role. Backoffice read-only. No updates. No deletes. Ever.

---

## Key Views (Read Models)

```sql
-- Public-facing trust signal for a listing
CREATE VIEW listing_trust_summary AS
SELECT
  l.id AS listing_id,
  l.qa_status,
  ARRAY_AGG(b.code) FILTER (WHERE bg.revoked_at IS NULL) AS active_badges,
  MAX(gp.deadline_at) FILTER (WHERE gp.closed_at IS NULL) AS active_grace_deadline
FROM listings l
LEFT JOIN badge_grants bg ON bg.listing_id = l.id
LEFT JOIN badges b ON b.id = bg.badge_id
LEFT JOIN grace_periods gp ON gp.listing_id = l.id
GROUP BY l.id, l.qa_status;
```

This view is the **only** way application code should read trust data for a listing. 
It encapsulates the join complexity. The application sees a single, clean row.
