# A4 — Backoffice & QA Engine Test Spec

## Verification Strategy
The system is verified through a combination of database-level integrity checks, server action unit tests, and component-level UI tests.

### 1. Database Integrity (Supabase Tests)
-   **State Transitions:** Verify that `listings.qa_status` updates correctly when `qa_checks` are inserted.
-   **Badge Automation:** Confirm that `badge_grants` are created on 'pass' and revoked on 'fail/revoke' via DB triggers.
-   **Audit Logging:** Ensure every mutation triggers an `audit_log` entry with the correct payload.

### 2. Server Action Validation
-   **RBAC Enforcement:** Verify that actions (e.g., `approveListing`) return 'Unauthorized' for non-admin users.
-   **Input Sanitization:** Test Zod schema validation for all form data.
-   **State Consistency:** Confirm that actions atomically update the target record and the audit log.

### 3. Edge Function Unit Tests
-   **Batch Trigger:** Test cursor-based pagination and run initiation logic.
-   **Grace Period Enforcement:** Verify that expired periods correctly trigger the 'failing' transition.
-   **Taste Timeout:** Ensure pending checks are correctly skipped after the 7-day window.

### 4. Backoffice UI Components
-   **Prioritization:** Confirm `WorkQueueSection` renders items in the correct order of importance.
-   **Interactive Feedback:** Test `useActionState` pending/error states in `ListingActions` and `ResolveFlagButton`.
-   **Temporal UI:** Verify `GracePeriodTimer` correctly calculates time remaining and switches to 'EXPIRED' state.

## Manual Smoke Test Procedure
1.  Submit a new listing via the Builder Dashboard.
2.  Navigate to `/backoffice/queue` and verify the listing appears in "Priority 3: New Submissions".
3.  Approve the listing and verify it moves to "Live" status.
4.  Manually open a grace period and verify the `GracePeriodTimer` appears on the listing detail page.
5.  Resolve a flag and verify the audit log records the action correctly.
