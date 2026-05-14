# Agent A5 — Community & Rewards Test Specification

This document outlines the testing strategy for the Community and Rewards system, covering unit tests, database tests, and integration scenarios.

## 1. Unit Testing (Vitest)

### Auth Guards
- **`requireTaster`**:
    - Tests successful claim return for active tasters.
    - Tests 403 throw for suspended/retired tasters.
    - Tests 403 throw for missing taster records.
    - **Note**: Mocked Supabase client includes `.schema('community')` to match implementation.

### Server Actions
- **`submitTasterApplication`**:
    - Validates motivation length (20-1000 chars).
    - Ensures only one application per user (handles `23505` unique constraint error).
- **`castTasteVote`**:
    - Validates score range (1-5).
    - Ensures user is an active taster via `requireTaster`.
    - Handles duplicate vote attempts.
- **`redeemVoucher`**:
    - Maps database exceptions (`UNAUTHORIZED`, `INVALID`, `EXPIRED`) to Martie-toned messages.
    - Verifies that `activation_result` is fetched correctly after a successful RPC call.

---

## 2. Database Testing (pgTAP)

The test suite in `supabase/tests/a5_community_rewards_test.sql` covers:

### Voucher Issuance (`issue_voucher`)
- Verifies generation of internal codes (`MARTIE-XXXX`).
- Verifies allocation of external codes from `external_code_pool`.
- Ensures `bearer_id` is correctly assigned and immutable.

### Atomic Redemption (`redeem_voucher`)
- Tests successful state transition from `available` to `redeemed`.
- Verifies that `redemptions` records are created with proper metadata.
- Tests concurrency safety (simulated via `FOR UPDATE` logic in function).
- Tests bearer mismatch and expiry enforcement.

### Taster Reputation & Quorum
- Verifies that `taste_verdicts` are computed only after the quorum threshold is met.
- Verifies reputation score adjustments based on vote proximity to the weighted average.

---

## 3. Edge Function Testing

### `earn-policy-enforcer`
- **Scenarios**:
    - Milestone triggers: Verifies voucher issuance when `vote_count` hits policy thresholds.
    - Reputation triggers: Verifies issuance for high-reputation tiers.
    - Repeatability: Ensures non-repeatable rewards are issued only once per user/reason.
- **Mocking**: Deno environment variables and Supabase service role client are simulated to verify logic flow.

---

## 4. Integration Scenarios

1. **Application → Approval**: User applies → Application status updated to 'approved' → `tasters` record exists → Dashboard accessible.
2. **Vote → Reward**: Taster votes → Milestone reached → `vouchers` record issued → Wallet updated.
3. **Voucher → Redeem**: User selects voucher → `redeemVoucher` called → External code displayed once → Voucher status set to `redeemed`.

---
**"Verified by Martie."**
