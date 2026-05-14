# Test Specification: Agent A0 — Schema & Foundation

This document details the testing strategy, mocks, and rationales used to verify the SassyMartie Database Foundation.

---

## 1. Test Rationale
In a "Database-First" architecture, the schema is the ultimate contract. By testing logic (triggers/functions) directly in SQL within a transaction, we verify:
1. **Symmetry:** Triggers fire as expected across different schemas.
2. **Security:** RLS policies are structurally sound.
3. **Atomicity:** Complex operations like `redeem_voucher` handle row locking correctly.

## 2. Scope of Testing

### 2.1 What is Tested
- **Trigger Propagations:** 
    - `auth.users` -> `builder.lister_profiles` (Profile creation).
    - `trust.qa_checks` -> `trust.badge_grants` (Badge awarding).
    - `catalog.listings` -> `trust.badge_grants` (Badge revocation cascade).
    - `community.taste_votes` -> `community.taste_verdicts` (Quorum logic).
- **Function Logic:** 
    - `rewards.redeem_voucher` (Atomic state transitions).
    - `community.compute_taste_verdict` (Weighted reputation math).
- **RLS Boundaries:** (Simulated via session variables and role checks).

### 2.2 What is Mocked
- **Auth Identity:** `auth.users` entries are manually inserted with JSONB metadata to simulate different roles (lister, backoffice).
- **System Config:** `public.system_config` values are seeded with test-specific thresholds (e.g., quorum=2) to allow small-scale testing.
- **Temporal State:** `now()` is used for all timestamp-based logic; manual updates to status fields are used to simulate the passage of the QA lifecycle.

## 3. Verification Suite
The actual SQL test script used for verification can be found at:
`supabase/tests/a0_foundation_test.sql`

---

## 4. Key Rationales

### Why Database-Level Quorum?
**Decision:** Quorum logic lives in a DB trigger, not an Edge Function.
**Rationale:** Consensus is a data-integrity concern. By locking the `taste_verdicts` table during computation, we prevent double-counting votes or inconsistent state if two tasters vote simultaneously.

### Why Audit Log Immutability?
**Decision:** No UPDATE/DELETE policies on `audit_log`.
**Rationale:** To provide a tamper-proof trail for backoffice actions. Even with superuser-like metadata, the RLS policy acts as a secondary wall against internal data manipulation.

### Why "Dual-Client" SSR Utilities?
**Decision:** Explicit separate clients for Browser, Server, and Middleware.
**Rationale:** Next.js 15 has strict requirements for cookie handling. A single client approach leads to session flickering and stale JWTs. The `@supabase/ssr` package is used to handle the complexity of cookie synchronisation between the Edge and the Server.
