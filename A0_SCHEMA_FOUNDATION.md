# Agent A0 — Schema & Foundation
**Branch:** `feat/a0-schema-foundation`
**Phase:** 0 (Sequential. All other agents are blocked until your branch merges to `dev`.)

---

## Your Job in One Sentence
Write the entire database. When you're done, `npx supabase gen types` runs clean, and the output is the contract every other agent codes against.

## Mandatory Reading (in this order)
1. `00_DOMAIN_MODEL.md` — understand the four bounded contexts and their schema separation
2. `01_SCHEMA_CONTRACTS.md` — your primary specification. Build exactly this.
3. `02_QA_ENGINE_STATE_MACHINE.md` — DB-level triggers and state transitions are your responsibility
4. `06_TASTER_COMMITTEE_SYSTEM.md` — `redeem_voucher()` SECURITY DEFINER function lives here
5. `07_VOUCHER_REWARD_SYSTEM.md` — `redeem_voucher()` full implementation contract
6. `GEMINI.md` — mandatory RLS and security rules

## Deliverables Checklist

### Migrations (`supabase/migrations/`)
- [x] `20240514000001_schemas.sql` — CREATE SCHEMA for `catalog`, `trust`, `builder`, `backoffice`, `rewards`
- [x] `20240514000002_enums.sql` — all enum types (pricing_model, listing status, qa_status, check_type, etc.)
- [x] `20240514000003_catalog_tables.sql` — listings, utilities, editorials
- [x] `20240514000004_trust_tables.sql` — qa_runs, qa_checks, badges, badge_grants, grace_periods
- [x] `20240514000005_builder_tables.sql` — lister_profiles
- [x] `20240514000006_backoffice_tables.sql` — flags, audit_log
- [x] `20240514000007_rewards_tables.sql` — reward_items, vouchers, redemptions, earn_policies, external_code_pool
- [x] `20240514000008_community_tables.sql` — taster_applications, tasters, taste_votes, taste_verdicts
- [x] `20240514000009_system_config.sql` — system_config table + all seed rows
- [x] `20240514000010_indexes.sql` — every RLS-filtered column indexed
- [x] `20240514000011_rls_policies.sql` — RLS enabled + forced on all tables. All policies defined.
- [x] `20240514000012_triggers.sql` — updated_at, badge grant/revoke, reputation update, taster auto-create
- [x] `20240514000013_views.sql` — listing_trust_summary, taster_wallet, backoffice_work_queue
- [x] `20240514000014_functions.sql` — redeem_voucher(), compute_taste_verdict(), award_badge_if_eligible(), check_and_compute_taste_verdict()
- [x] `20240514000015_seed_config.sql` — system_config seed data
- [x] `20240514000016_a3_builder_extensions.sql` — Extensions for builder context
- [x] `20240514000017_update_work_queue_view.sql` — Backoffice work queue refinements
- [x] `20240514000018_qa_state_machine.sql` — State machine transitions and cron schedules

### Application Utilities (`src/utils/supabase/`)
- [x] `browser.ts` — createBrowserClient
- [x] `server.ts` — createServerClient with cookie handler
- [x] `middleware.ts` — middleware-specific client
- [x] `database.types.ts` — generated via `npx supabase gen types`. Do not hand-edit.

## Merge Gate
Before opening your PR to `dev`:
1. Run migrations on a clean Supabase instance — zero errors
2. Run `npx supabase gen types` — confirm output is clean and complete
3. All other agents review the generated `database.types.ts` before Phase 1 begins

## Rules
- Never embed business logic in application code if a DB trigger or function can own it
- Every table: `ALTER TABLE x ENABLE ROW LEVEL SECURITY` + `ALTER TABLE x FORCE ROW LEVEL SECURITY`
- `audit_log`: no UPDATE policy, no DELETE policy, for any role, ever
- `vouchers.bearer_id`: no UPDATE path. Column is write-once.
