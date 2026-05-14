# Agent A4 — Backoffice & QA Engine
**Branch:** `feat/a4-backoffice-qa-engine`
**Phase:** 1 (Starts when A0 merges. Soft dependency on A1 for role guards.)

---

## Your Job in One Sentence
Build the admin command center and the automated QA machinery — the two sides of the operational trust system.

## Mandatory Reading
1. `04_BACKOFFICE_COMMAND_CENTER.md` — your primary spec for the admin UI
2. `02_QA_ENGINE_STATE_MACHINE.md` — your primary spec for the QA engine
3. `01_SCHEMA_CONTRACTS.md` — backoffice schema, audit_log contract
4. `05_ROUTING_AND_APP_CONTRACTS.md` — backoffice route tree
5. `GEMINI.md` — RLS, getClaims Mandate, Server Actions

## Auth Stub Strategy
Same as A3. Stub `requireRole()` locally, swap for A1's real implementation before PR.
Your routes require `role IN ('backoffice_admin', 'backoffice_reviewer')`. Do not merge the stub.

## Deliverables Checklist

### Backoffice Pages
- [ ] `app/backoffice/page.tsx` — redirect to `/backoffice/queue`
- [ ] `app/backoffice/queue/page.tsx` — prioritized work queue (queries `backoffice_work_queue` view)
  - Section 1: Grace periods expiring within 6 hours
  - Section 2: Taste checks pending human vote (Phase 1: empty, but render the section)
  - Section 3: Newly submitted listings
  - Section 4: Unresolved flags by severity
- [ ] `app/backoffice/listings/page.tsx` — all listings, searchable, status filterable
- [ ] `app/backoffice/listings/[id]/page.tsx` — full admin view: listing details, QA run history, all flags, grace periods, full audit log
- [ ] `app/backoffice/builders/page.tsx` — all lister profiles
- [ ] `app/backoffice/qa/runs/page.tsx` — QA run history with check breakdown
- [ ] `app/backoffice/tasters/page.tsx` — taster application queue (approve/reject). Renders A5's data.

### Backoffice Server Actions (`src/actions/backoffice/`)
- [ ] `approve-listing.ts` — `status: 'pending_review' → 'live'`, `published_at = now()`, triggers first QA run, writes audit_log
- [ ] `reject-listing.ts` — `status: 'pending_review' → 'draft'`, writes audit_log, queues builder notification
- [ ] `open-grace-period.ts` — INSERT grace_periods, `qa_status → 'grace_period'`, writes audit_log
- [ ] `revoke-badge.ts` — sets `badge_grants.revoked_at`, writes audit_log
- [ ] `flag-tool.ts` — INSERT flags. If severity = 'critical', call open-grace-period as side effect.
- [ ] `resolve-flag.ts` — sets `flags.resolved_at`, writes audit_log
- [ ] `approve-taster.ts` — sets `taster_applications.status = 'approved'`, DB trigger auto-creates `tasters` row
- [ ] `reject-taster.ts` — sets `taster_applications.status = 'rejected'`, writes rejection_reason

### QA Engine (Supabase Edge Functions in `supabase/functions/`)
- [ ] `qa-trigger-batch/index.ts` — scheduled by pg_cron. Fetches live listings in cursor pages, INSERTs qa_runs.
- [ ] `qa-check-functional/index.ts` — stub headless browser check. Writes result to qa_checks.
- [ ] `qa-check-security/index.ts` — stub OWASP surface scan. Writes result to qa_checks.
- [ ] `qa-grace-period-enforcer/index.ts` — daily. Finds expired grace periods, executes FAILING transition.
- [ ] `qa-taste-timeout/index.ts` — daily. Finds taste checks past vote window, sets result = 'skip'.
- [ ] `notify-builder/index.ts` — sends email via transactional provider (Resend/Postmark). Called by other functions.

### Components (`src/components/backoffice/`)
- [ ] `WorkQueueSection` — section header + item list for each priority tier
- [ ] `WorkQueueItem` — single item in queue (listing name, status, action CTA)
- [ ] `QARunDetail` — shows all qa_checks for a run with individual results
- [ ] `AuditLogTable` — paginated audit_log display for a listing
- [ ] `GracePeriodTimer` — countdown to deadline_at
- [ ] `FlagCard` — flag detail with severity indicator + resolve button
- [ ] `TasterApplicationCard` — application summary with approve/reject actions

## Audit Log Write Contract
Every Server Action that changes state MUST write to `audit_log` as its final step.
Shape:
```typescript
await supabase.from('audit_log').insert({
  actor_id: claims.sub,
  action: 'listing.approve',          // use dot-notation verb.noun
  target_type: 'listing',
  target_id: listingId,
  payload: { before: {...}, after: {...}, notes: '...' }
})
```
A3 reads these rows. Write them correctly. This is the cross-agent contract.

## Edge Function Deployment
Each Edge Function must have a corresponding `pg_cron` or trigger setup documented in a migration file.
Work with A0's migration files if cron schedules need to be added post-merge.

## Merge Gate
1. `npm run build` passes (with A1's real role guards)
2. `npm run lint` passes
3. Work queue renders correctly with seeded test data
4. `approve-listing` action writes to audit_log — verify A3 can read it in QA health timeline
5. QA batch function runs without timeout on 100 listings
