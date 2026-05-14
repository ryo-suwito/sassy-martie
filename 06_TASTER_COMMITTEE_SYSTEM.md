# SassyMartie: The Taster Committee System

> The Taste Test is not a Martie admin task. It is a community governance product.
> Martie's role is not to judge taste. Martie's role is to judge who gets to judge taste.

---

## The Core Insight

The committee model solves three problems simultaneously:

1. **The scaling problem**: Martie cannot taste-test hundreds of tools. A committee can.
2. **The bias problem**: One person's opinion is taste. Many people's consensus is a signal.
3. **The engagement problem**: Loyal users who care deeply about quality want a *role*, not just a subscription.

The architecture must never hard-code what "the incentive" is.
The privilege system is a policy, not a schema. The schema just tracks *who has earned what*.

---

## New Entities

### `taster_applications`
A user's petition to join the committee. Reviewed once by Martie.

| Column           | Type         | Notes                                                       |
|------------------|--------------|-------------------------------------------------------------|
| id               | uuid PK      |                                                             |
| applicant_id     | uuid FK → auth.users NOT NULL |                                            |
| motivation       | text NOT NULL | "Why do you want to be a Taster?" Free-form, 500 char max. |
| status           | enum('pending','approved','rejected') NOT NULL DEFAULT 'pending' |       |
| reviewed_by      | uuid FK → auth.users | Backoffice actor who made the call.                |
| reviewed_at      | timestamptz  |                                                             |
| rejection_reason | text         | Surfaced to applicant. Be Martie-toned.                     |
| created_at       | timestamptz NOT NULL DEFAULT now() |                                     |

**RLS:** Applicant sees their own row. Backoffice sees all.

---

### `tasters`
The approved committee members. One row per active Taster.
Created automatically when a `taster_application.status` is set to `'approved'` (via trigger).

| Column           | Type         | Notes                                                       |
|------------------|--------------|-------------------------------------------------------------|
| id               | uuid PK FK → auth.users | 1:1 with auth user.                              |
| application_id   | uuid FK → taster_applications NOT NULL |                                 |
| status           | enum('active','suspended','retired') NOT NULL DEFAULT 'active' |         |
| vote_count       | integer NOT NULL DEFAULT 0 | Materialized counter. Incremented by trigger.  |
| reputation_score | numeric(5,2) NOT NULL DEFAULT 0.00 | Derived from vote accuracy over time.  |
| suspended_at     | timestamptz  |                                                             |
| suspended_reason | text         |                                                             |
| joined_at        | timestamptz NOT NULL DEFAULT now() |                                     |

**The `reputation_score` is the foundation of the weighted voting system.**
It starts at 0. It grows as a Taster's votes align with the eventual consensus.
A Taster who consistently votes against consensus loses reputation. This self-corrects bad actors.

---

### `taste_votes`
A single Taster's verdict on a specific listing. The atomic unit of the committee system.

| Column           | Type         | Notes                                                       |
|------------------|--------------|-------------------------------------------------------------|
| id               | uuid PK      |                                                             |
| listing_id       | uuid FK → listings NOT NULL |                                                |
| taster_id        | uuid FK → tasters NOT NULL |                                                 |
| qa_run_id        | uuid FK → qa_runs NOT NULL | Which evaluation cycle this vote belongs to.   |
| score            | integer NOT NULL | 1–5 scale. Not binary. Nuance matters.                  |
| rationale        | text         | Optional. Shown to builder if verdict is negative.          |
| voted_at         | timestamptz NOT NULL DEFAULT now() |                                     |

**Unique constraint:** `(listing_id, taster_id, qa_run_id)` — one vote per taster per run.

**RLS:**
- A Taster can only INSERT their own votes.
- A Taster CANNOT read other votes until the quorum is reached (prevents anchoring bias).
- After quorum: all votes for a run become visible to all Tasters.
- Public: aggregate result only (no individual vote exposure).
- Backoffice: full read.

---

### `taste_verdicts`
The computed result of a voting round. Written by a DB function, not the application.

| Column              | Type         | Notes                                                    |
|---------------------|--------------|----------------------------------------------------------|
| id                  | uuid PK      |                                                          |
| listing_id          | uuid FK → listings NOT NULL |                                               |
| qa_run_id           | uuid FK → qa_runs NOT NULL |                                                |
| quorum_reached_at   | timestamptz  | When the vote count hit threshold.                       |
| vote_count          | integer NOT NULL |                                                      |
| weighted_avg_score  | numeric(4,2) NOT NULL | The weighted mean, using taster reputation as weight. |
| verdict             | enum('pass','fail') NOT NULL | Applied at a defined threshold (e.g., ≥ 3.5 = pass). |

**This table is written by a single DB function** `compute_taste_verdict(qa_run_id)`.
It is called by a trigger AFTER INSERT ON `taste_votes` whenever the vote count 
hits the quorum minimum.

---

## The Quorum Model

Quorum parameters live in `system_config`. Not in code. Backoffice can tune them.

```
system_config key: 'taste_quorum_minimum'    → value: '5'   (votes needed to reach verdict)
system_config key: 'taste_pass_threshold'    → value: '3.5' (weighted avg ≥ this = pass)
system_config key: 'taste_vote_window_days'  → value: '7'   (window before timeout)
```

### Quorum Trigger Logic

```
AFTER INSERT ON taste_votes
FOR EACH ROW
EXECUTE FUNCTION check_and_compute_taste_verdict()

check_and_compute_taste_verdict():
  1. Count votes WHERE qa_run_id = NEW.qa_run_id
  2. IF count < system_config('taste_quorum_minimum') → do nothing, return
  3. IF count >= quorum:
       → compute weighted_avg_score (SUM(score * taster.reputation_score) / SUM(reputation_score))
       → derive verdict: avg >= threshold → 'pass', else 'fail'
       → INSERT INTO taste_verdicts
       → UPDATE qa_checks SET result = verdict WHERE run_id = NEW.qa_run_id AND check_type = 'taste_test'
       → Trigger downstream QA run completion check
```

---

## The Timeout Fallback

A vote window exists because quorum may never be reached (low taster activity in early days).

A `pg_cron` job runs daily:
```
SELECT * FROM qa_runs
WHERE overall_result = 'pending'
  AND initiated_at < now() - INTERVAL system_config('taste_vote_window_days') || ' days'
```

For expired runs: the `taste_test` check is set to `'skip'`. The QA run completes 
on the other two checks only. The listing can still earn `SECURITY_VERIFIED` and 
`FULLY_FUNCTIONAL` badges. The `TASTE_APPROVED` badge simply doesn't exist yet for that tool.

**This is the Phase 1 → Phase 2 transition encoded in data:**
- Phase 1 (no traction): quorum is never reached → `taste_test` always times out → `skip`
- Phase 2 (traction): the committee is active → quorum is reached → verdicts are computed
- No schema migration required. No feature flag. The system responds to its own activity.

---

## Taster Privileges: The Scaffolding

The schema does not know what the incentive is. It only knows:
- A user is a Taster (`tasters.status = 'active'`)
- A Taster has a reputation score
- A Taster has a vote count

The application checks `tasters.status` as a gate to unlock *whatever the privilege is*.
The privilege itself is a policy decision, not a data model decision.

```typescript
// The gate. What's behind it is TBD by product.
async function hasTasterPrivilege(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('tasters')
    .select('status')
    .eq('id', userId)
    .eq('status', 'active')
    .maybeSingle()
  return !!data
}
```

When the product decides the incentive (free features, badge on profile, leaderboard status),
the *implementation* of the privilege changes. The *gate check* does not.

---

## Reputation Score: The Self-Correcting System

Reputation is not manually assigned. It is computed from voting behavior.

**How it grows:**
After a `taste_verdict` is computed, all individual votes in that run are scored:
- Vote was within ±0.5 of the `weighted_avg_score` → `+0.1` reputation
- Vote was within ±1.0 → `+0.05` reputation
- Vote was outside ±1.0 → `-0.05` reputation (outlier penalty)

**Why this matters:**
- New Tasters start at 0. Their votes have near-zero weight.
- Consistent, calibrated Tasters accumulate influence over time.
- Outlier Tasters (trolls, rubber-stampers) lose influence without being expelled.
- Expulsion (suspension) is a backoffice action, reserved for egregious behavior.

This is a **lightweight reputation economy** with no manual administration overhead.

---

## Backoffice Role in This System

Martie's committee management is minimal by design:

1. **Approve / Reject applications** — the only active task.
2. **Suspend a Taster** — for egregious behavior (harassment, coordinated fraud).
3. **Monitor the vote window expiry queue** — are enough tools getting tasted? If not, recruit more.

The system self-manages quality through reputation.
Martie manages access, not quality. That's the correct separation.
