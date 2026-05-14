# Agent A5 — Community & Rewards Documentation

This document outlines the implementation, architecture, and technical rationales for the SassyMartie Community and Rewards system.

## 1. Core Architecture

### The Taster Committee Flow
The Taster system is a community governance model designed to scale quality control.
- **Application**: Users apply via `/apply/taster`. Data is stored in `community.taster_applications`.
- **Approval**: Once approved (via Backoffice), a trigger creates a record in `community.tasters`.
- **Status Gating**: The `requireTaster()` guard in `src/lib/auth/guards.ts` ensures that only active Tasters can access `/dashboard/taster/*`. It performs a schema-specific check on the `community` schema.

### Blind Voting Mechanism
To prevent anchoring bias and ensure integrity, the voting system implements "blinding."
- **Implementation**: Tasters can view listings in their queue and cast a weighted score (1-5).
- **Blinding Rule**: Tasters cannot see other votes for a specific QA run until the quorum (defined in `system_config`) is reached.
- **Rationale**: This ensures that each Taster provides an independent assessment, which is then aggregated into a weighted average based on individual reputation scores.

### Secure Voucher Redemption (The Bearer-Binding Law)
As specified in `07_VOUCHER_REWARD_SYSTEM.md`, vouchers are physically bound to the bearer to avoid legal complexities of transferable tokens.
- **Redemption**: Handled exclusively via the `rewards.redeem_voucher` SECURITY DEFINER function.
- **Atomic Locking**: The function uses `FOR UPDATE` to prevent double-redemption or race conditions.
- **One-Time Display**: For `external_code` rewards, the activation result is shown once in the UI and not stored in the application layer, ensuring the "claimed" state is terminal.

---

## 2. Technical Implementation Details

### Automated Rewarding (Edge Function)
The `earn-policy-enforcer` Edge Function automates the distribution of rewards.
- **Trigger**: Webhook on `community.taste_votes` INSERT.
- **Logic**: Evaluates the Taster's `vote_count` and `reputation_score` against `rewards.earn_policies`. 
- **Issuance**: Calls `rewards.issue_voucher` to create an immutable link between a user and a reward.

### Read Models & Views
- **`rewards.voucher_wallet`**: A consolidated view used by the `WalletView` component to show reward names, descriptions, and redeemability status without exposing sensitive internal codes until redemption.
- **`community.taster_wallet`**: Provides stats for the Taster Dashboard, including vote counts and reputation scores.

---

## 3. Security & Integrity

- **Schema Isolation**: All community and rewards logic is isolated into the `community` and `rewards` schemas respectively.
- **RLS Enforcement**:
    - Tasters can only INSERT their own votes.
    - Vouchers are only visible to their `bearer_id`.
    - Redemptions are immutable (no UPDATE/DELETE policies).
- **Martie-Toned Errors**: Database exceptions (e.g., `UNAUTHORIZED`, `EXPIRED`) are mapped to user-friendly, brand-aligned messages in the Server Actions layer.

---
**"Refined by the Committee. Protected by Martie."**
