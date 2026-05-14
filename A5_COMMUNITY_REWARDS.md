# Agent A5 — Community & Rewards
**Branch:** `feat/a5-community-rewards`
**Phase:** 2 (Starts ONLY after A1 + A3 have merged to `dev` and `dev` build is green.)

---

## Your Job in One Sentence
Build the Taster experience end-to-end — applying, voting, earning, and spending rewards via the voucher wallet.

## Pre-Start Checklist (Before Writing a Single Line)
- [ ] Pull latest `dev`
- [ ] Run `npm run build` — must be green
- [ ] Confirm A1's `requireTaster()` guard exists in `src/lib/auth/guards.ts`
- [ ] Confirm A3's `/dashboard` shell and layout render correctly
- [ ] Confirm A0's `tasters`, `taste_votes`, `vouchers`, `redemptions` tables exist in `database.types.ts`
If any of the above fails, do not begin. Raise with A1/A3 agent to resolve first.

## Mandatory Reading
1. `06_TASTER_COMMITTEE_SYSTEM.md` — your primary spec for the committee system
2. `07_VOUCHER_REWARD_SYSTEM.md` — your primary spec for the voucher wallet
3. `05_ROUTING_AND_APP_CONTRACTS.md` — your routes
4. `GEMINI.md` — getClaims Mandate, Server Actions

## Deliverables Checklist

### Pages
- [ ] `app/apply/taster/page.tsx` — public application form. Motivation textarea. `submitTasterApplication` action.
- [ ] `app/apply/taster/confirmation/page.tsx` — "Application received. Martie will review." static page.
- [ ] `app/dashboard/taster/page.tsx` — Taster home. Gated by `requireTaster()`. Shows vote queue + wallet summary.
- [ ] `app/dashboard/taster/vote/page.tsx` — Active taste vote queue. Shows listings awaiting votes. Blinded (no other votes visible until quorum).
- [ ] `app/dashboard/taster/vote/[listingId]/page.tsx` — Single vote form. Score 1-5 + optional rationale. `castTasteVote` action.
- [ ] `app/dashboard/taster/wallet/page.tsx` — Full voucher wallet. Queries `taster_wallet` view. Grouped by status.
- [ ] `app/dashboard/taster/redeem/[voucherId]/page.tsx` — Calls `redeemVoucher` action. Shows activation result. Result shown once.

### Server Actions (`src/actions/community/`)
- [ ] `submit-taster-application.ts` — INSERT `taster_applications`. One application per user (unique constraint check).
- [ ] `cast-taste-vote.ts` — INSERT `taste_votes`. Unique constraint on (listing_id, taster_id, qa_run_id). DB trigger handles quorum check and verdict computation automatically.

### Server Actions (`src/actions/rewards/`)
- [ ] `redeem-voucher.ts` — thin wrapper. Calls `SELECT redeem_voucher($1)` DB function. Returns activation result. Handles exception types (UNAUTHORIZED, INVALID, EXPIRED) as Martie-toned user messages.

### Components (`src/components/community/`)
- [ ] `VoteCard` — listing summary for voting. Score slider/selector + rationale input. Disabled after vote submitted.
- [ ] `VoteQueueEmpty` — state when no listings need votes. Encourage checking back.
- [ ] `TasterStatusBanner` — shows vote_count, reputation_score. Displayed on taster home.

### Components (`src/components/rewards/`)
- [ ] `VoucherCard` — shows reward name, description, expiry, status. "Redeem" CTA when `is_redeemable = true`.
- [ ] `WalletView` — groups vouchers by status (available, redeemed, expired)
- [ ] `RedemptionResultModal` — shows activation result after redeem. Dismissable. For `external_code` type: shows code in a copy-to-clipboard field. This is the one-time display — handle accordingly.
- [ ] `WalletSummaryWidget` — compact widget for taster dashboard home (available count + CTA)

### Earn Policy Enforcement (Edge Function)
- [ ] `supabase/functions/earn-policy-enforcer/index.ts`
  - Called after every `taste_votes` INSERT (or via Supabase webhook on that table)
  - Fetches `earn_policies WHERE is_active = true`
  - Checks taster's current `vote_count` and `reputation_score` against policy trigger values
  - If policy triggered and not already earned (for `is_repeatable = false`): calls `issue_voucher(bearer_id, reward_item_id, reason)`

## Critical Rules

### The Redemption One-Time Display
For `activation_type = 'external_code'`, the revealed code must be displayed ONCE and stored nowhere in the UI layer. The code is in `redemptions.activation_result`. Show it in the modal on the response, then route away. If the user claims they didn't see it, they redeem a separate voucher. No "re-show code" feature.

### Vote Blinding
The vote form must NOT show other Tasters' scores while the vote window is open.
The `taste_votes` RLS policy enforces this at the DB level, but do not attempt to query other votes in the UI either. Trust the schema.

### Redeem Error Handling
The `redeem_voucher()` function raises named exceptions. Map them to Martie-toned messages:
- `UNAUTHORIZED` → "This one's not yours, friend."
- `INVALID` → "This voucher's already been used."
- `EXPIRED` → "This one slipped through your fingers. It's expired."

## Merge Gate
1. `npm run build` passes (on top of merged A1 + A3 on dev)
2. `npm run lint` passes
3. Full end-to-end on dev: apply → A4 approves → vote → quorum reached → verdict computed → TASTE_APPROVED badge granted → wallet shows new voucher → redeem → result displayed
4. Concurrent redeem attempt on same voucher fails gracefully (test with two sessions)
5. Non-Taster cannot access `/dashboard/taster/*` (403, not redirect)
