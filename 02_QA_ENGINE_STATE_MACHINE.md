# SassyMartie: QA Engine & Trust State Machine

> Problem #2: The Trust Deficit. The QA Engine is the entire answer.
> This document defines the state machine, the trigger graph, and the badge lifecycle.

---

## The Core Insight

Trust is not a boolean. It is a **state** that decays and recovers over time.
A tool that was secure last month may be compromised today.
The system must model this as a time-series of states, not a one-time check.

---

## Listing QA State Machine

```
                    ┌─────────────┐
          submit    │             │
    ─────────────►  │  UNVERIFIED │
                    │             │
                    └──────┬──────┘
                           │ QA run initiated
                           ▼
                    ┌─────────────┐
                    │             │
                    │   PENDING   │ ◄── (in-flight run)
                    │             │
                    └──────┬──────┘
              ┌────────────┴────────────┐
              │ all checks pass         │ any check fails
              ▼                         ▼
       ┌──────────┐             ┌──────────────┐
       │          │             │              │
       │ PASSING  │             │ GRACE_PERIOD │ ◄── 48hr window opens
       │          │             │              │
       └────┬─────┘             └──────┬───────┘
            │                          │
            │ scheduled re-run fails   │ builder fixes + re-run passes
            ▼                          ▼
       ┌──────────┐             ┌──────────┐
       │          │             │          │
       │  GRACE_  │             │ PASSING  │
       │  PERIOD  │             │          │
       │          │             └──────────┘
       └────┬─────┘
            │ deadline_at passes with no resolution
            │ OR backoffice manual revoke
            ▼
       ┌──────────┐
       │          │
       │  FAILING │ ── badge_grants.revoked_at SET ──► badges stripped
       │          │
       └──────────┘
```

**State lives in:** `listings.qa_status` (enum)  
**State transitions are executed by:** Postgres functions called from Supabase Edge Functions.  
**State history is recorded in:** `audit_log` (immutable).

---

## The Three Check Types

Each `qa_run` spawns exactly three `qa_checks`. Each check is independent. 
`functional` and `security` are synchronous. `taste_test` is **async and community-owned**.

| Check Type      | What It Tests                                          | Who Executes | Blocking? |
|-----------------|--------------------------------------------------------|--------------|----------|
| `functional`    | Does the tool's core workflow work end-to-end?         | Automated headless browser | Yes |
| `security`      | OWASP top-10 surface scan (SQLi, XSS headers, HTTPS)  | Automated scanner | Yes |
| `taste_test`    | Is the UX not garbage? Does it match its description?  | **The Taster Committee** (community vote) | No — async |

**Key Architecture Decision:** `taste_test` is decoupled from the synchronous QA run.
- `functional` and `security` resolve first. A listing can earn those two badges independently.
- `taste_test` opens a vote window. The committee votes. When quorum is reached, the check resolves.
- If quorum is never reached within the window, `taste_test` result = `'skip'`. The run completes without it.
- **Phase 1 reality (pre-traction):** The committee doesn't exist yet. All taste checks time out to `'skip'`. 
  The `TASTE_APPROVED` badge simply does not get awarded. No breakage, no feature flag needed.
- **Phase 2 (post-traction):** The committee is active. Quorum is reached. Verdicts are computed.

See `06_TASTER_COMMITTEE_SYSTEM.md` for the full voting, reputation, and quorum architecture.

---

## Badge Lifecycle

Badges are **consequences** of QA state, not inputs. The application never directly grants 
a badge — a DB trigger on `qa_checks` does.

### Grant Trigger Logic
```
AFTER UPDATE ON qa_checks
FOR EACH ROW
WHEN (NEW.result = 'pass')
→ Call award_badge_if_eligible(listing_id, check_type)
→ INSERT INTO badge_grants (listing_id, badge_id, granted_at)
   ON CONFLICT (listing_id, badge_id) WHERE revoked_at IS NULL DO NOTHING
```

### Revoke Trigger Logic
```
AFTER UPDATE ON listings
FOR EACH ROW
WHEN (NEW.qa_status = 'failing' OR NEW.qa_status = 'revoked')
→ UPDATE badge_grants 
   SET revoked_at = now(), revoked_by = current_setting('app.actor_id')
   WHERE listing_id = NEW.id AND revoked_at IS NULL
→ INSERT INTO audit_log (action = 'badge.bulk_revoke', ...)
```

**The `app.actor_id` setting:** Set at the start of every DB session by the application layer.
This is how the audit log knows *who* triggered the cascade, even for automated operations.

---

## Grace Period: The 48-Hour Contract

When `overall_result = 'fail'` on a `qa_run`:

1. `listings.qa_status` → `'grace_period'`
2. INSERT into `grace_periods` with `deadline_at = now() + INTERVAL '48 hours'`
3. Supabase Edge Function schedules a job to check at `deadline_at`
4. Badges are **NOT immediately revoked**. They enter a visual "warning" state on the public UI.
5. At `deadline_at`, if `grace_periods.closed_at IS NULL` → execute the FAILING transition.

**The 48-hour window is a business rule, not a technical constant.**  
It lives in a `system_config` table so backoffice can adjust it without a deploy.

```
system_config
─────────────
key: 'grace_period_hours'      | value: '48'
key: 'qa_schedule_cron'        | value: '0 3 * * 1'  (weekly, 3am Monday)
key: 'taste_quorum_minimum'    | value: '5'
key: 'taste_pass_threshold'    | value: '3.5'
key: 'taste_vote_window_days'  | value: '7'
```

---

## Scheduling Architecture

Supabase `pg_cron` + Edge Functions. No external job runner needed.

```
pg_cron schedule: '0 3 * * 1'  (weekly)
  └─► HTTP POST to /api/internal/qa/trigger-batch
        └─► Edge Function: fetch all listings WHERE status = 'live'
              └─► For each listing: INSERT INTO qa_runs (triggered_by = 'scheduled')
                    └─► Spawn individual check jobs
                          └─► On completion: UPDATE qa_runs.overall_result
                                └─► DB trigger fires state machine transition
```

**Rate limiting:** Process max N listings per batch to avoid Edge Function timeout.
Use cursor-based pagination on `listings.id` for resumable batch processing.
