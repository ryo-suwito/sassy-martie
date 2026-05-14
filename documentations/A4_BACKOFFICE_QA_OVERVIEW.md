# A4 — Backoffice & QA Engine Overview

## Architecture
The Backoffice system is designed as an opinionated **Command Center**, moving away from generic CRUD tables to a prioritized workflow based on three operational verbs: **Review, Flag, and Escalate**.

### Core Components
1.  **Work Queue:** A prioritized read-model (Postgres View) that surfaces the most urgent tasks:
    *   Expiring Grace Periods (< 6h)
    *   Pending Taste Checks
    *   Newly Submitted Listings
    *   Unresolved Flags
2.  **Listing Command Center:** A detailed view for each tool integrating:
    *   QA Run History & granular check results
    *   Active Grace Period timers
    *   Audit Logs (Immutable ledger of all actions)
    *   Flag management
3.  **QA Engine:** A suite of Supabase Edge Functions orchestrating the trust state machine.

## QA State Machine
Listings transition through states based on automated and community checks:
-   `unverified` → `passing` (All checks pass)
-   `passing` → `grace_period` (Scheduled check fails)
-   `grace_period` → `passing` (Manual/Automated re-run passes within 48h)
-   `grace_period` → `failing` (Deadline passes without resolution)

### Check Types
| Type | Execution | Blocking? |
| :--- | :--- | :--- |
| `functional` | Headless Browser (Stub) | Yes |
| `security` | OWASP Surface Scan (Stub) | Yes |
| `taste_test` | Community Committee Vote | No |

## Audit Log Contract
Every administrative action (approval, rejection, flagging, revocation) MUST write to the `backoffice.audit_log` table. This serves as:
1.  **Accountability:** Who did what and when.
2.  **Builder Transparency:** The "Tool Health Timeline" visible to builders is derived from this log.
3.  **Dispute Resolution:** Official evidence for badge revocations.

## Security & RLS
-   **Role-Based Access:** Gated by JWT claims (`backoffice_admin`, `backoffice_reviewer`).
-   **Cryptographic Validation:** All server actions use `getClaims()` to verify signatures against public keys.
-   **Database Fortification:** All tables in `backoffice` and `trust` schemas are locked by default; actions are executed via `SECURITY DEFINER` functions or strict RLS policies.
