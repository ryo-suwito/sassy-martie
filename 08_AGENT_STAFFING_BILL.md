# SassyMartie: Agent Staffing Bill & Delivery Structure

> This document is the architect's bill to the lead.
> It answers: who builds what, in what order, who waits on whom, and how work merges back.
> Code is downstream of this document. This document is not downstream of anything.

---

## The Governing Principle

Agent scope maps directly to **bounded context**, not to file type or tech layer.
An agent owns a vertical slice — schema, server logic, UI, and tests for their context.
No agent touches another agent's context without a defined handoff contract.

---

## The Staffing Bill: 6 Agents

```
Phase 0 ──────────────────────────────────────────────────────────────────────
  [A0] Schema & Foundation Agent         (1 agent, sequential, gates everyone)

Phase 1 ──────────────────────────────────────────────────────────────────────
  [A1] Auth & Infrastructure Agent       (1 agent, parallel with A2-A4)
  [A2] Catalog & SEO Agent               (1 agent, parallel with A1, A3, A4)
  [A3] Builder Agent                     (1 agent, parallel with A1, A2, A4)
  [A4] Backoffice & QA Engine Agent      (1 agent, parallel with A1, A2, A3)

Phase 2 ──────────────────────────────────────────────────────────────────────
  [A5] Community & Rewards Agent         (1 agent, sequential, waits for A1+A3)
```

Total: **6 agents**. 1 sequential prerequisite. 4-way parallelism in Phase 1. 1 final phase.

---

## Agent Profiles

---

### [A0] Schema & Foundation Agent
**Phase:** 0 — Must complete and merge before any other agent writes application code.

**Core Responsibility:**
Write the entire database. Every table, enum, index, trigger, view, RLS policy, 
seed data, and type generation. The schema is the contract. All other agents consume it.

**Scope:**
- All Supabase migration files (`supabase/migrations/*.sql`)
- All enums, tables, indexes across all four schemas: `catalog`, `trust`, `builder`, `backoffice`, `rewards`
- All DB-level triggers (badge grant/revoke, `updated_at`, taster reputation update, voucher expiry sweep)
- All DB-level views (`listing_trust_summary`, `taster_wallet`, `backoffice_work_queue`)
- All `SECURITY DEFINER` functions (`redeem_voucher`, `compute_taste_verdict`, `award_badge_if_eligible`)
- All `system_config` seed rows (grace period hours, quorum params, QA cron)
- `src/utils/supabase/database.types.ts` — generated via `npx supabase gen types`
- `src/utils/supabase/` — the three client factories (browser, server, middleware)

**Does NOT own:**
- Any page, component, route, or Server Action.
- Any Edge Function (those are application runtime, not schema).

**Oversight:**
- A0 oversights nobody.
- **All five other agents are blocked on A0's merge.** This is the only hard sequential dependency in the project.
- A0's output is reviewed by all five agents before they begin. If a table shape is wrong, A0 fixes it before Phase 1 starts.

---

### [A1] Auth & Infrastructure Agent
**Phase:** 1 — Starts the moment A0 merges.

**Core Responsibility:**
Build the shared infrastructure layer that every other Phase 1 agent imports.
A1's output is a set of utilities and middleware — not pages.

**Scope:**
- `middleware.ts` — session refresh, `/dashboard` auth gate, `/backoffice` role gate, onboarding redirect
- `src/utils/supabase/server.ts` — `createServerClient` with cookie handler
- `src/utils/supabase/browser.ts` — `createBrowserClient`
- `src/utils/supabase/middleware.ts` — middleware-specific client
- `src/lib/auth/getClaims.ts` — typed wrapper for `supabase.auth.getClaims()`
- `src/lib/auth/guards.ts` — `requireAuth()`, `requireRole()`, `requireTaster()` helpers
- `src/lib/config/systemConfig.ts` — typed reader for `system_config` table
- `src/types/` — all TypeScript types for all contexts (`catalog.ts`, `trust.ts`, `builder.ts`, `backoffice.ts`, `rewards.ts`, `read-models.ts`)
- `/auth/login`, `/auth/signup`, `/auth/callback` pages

**Does NOT own:**
- Any page outside `/auth/*`.
- Any business logic, QA logic, or reward logic.

**Oversight:**
- A1 is a peer of A2, A3, A4. No agent oversights another in Phase 1.
- **A3 and A4 import A1's outputs** (guards, getClaims wrapper, types). A1 must not change these contracts mid-Phase without notifying the downstream agents.
- If A1's auth helpers change shape, it must version-bump and coordinate with A3 and A4.

---

### [A2] Catalog & SEO Agent
**Phase:** 1 — Starts when A0 merges. No dependency on A1.

**Core Responsibility:**
The public face of the product. Everything a Buyer sees before logging in.
Entirely read-only. Zero mutations.

**Scope:**
- `/` — catalog home, browse, search, filter by pricing/badge/category
- `/[slug]` — listing detail page with trust signal display, badge showcase, editorial links
- `/[username]` — public lister portfolio, "more from this builder" section
- `/utilities/[slug]` — internal utility runner page
- `/editorial/[slug]` — editorial/review detail page
- All SEO: `generateMetadata`, `sitemap.ts`, `robots.ts`, Open Graph tags
- All catalog caching contracts (cache keys, `revalidatePath` on status change)
- Public-facing UI components: `ListingCard`, `BadgeDisplay`, `TrustSummary`, `PricingBadge`

**Does NOT own:**
- Anything behind `/dashboard` or `/backoffice`.
- Any Server Action.
- Any auth-gated route.

**Oversight:**
- A2 is peer to A1, A3, A4.
- A2 consumes `database.types.ts` (from A0) and `read-models.ts` types (from A1).
- A2 does **not** wait for A1. It can import raw Supabase client directly for public queries. If A1 delivers shared client utilities before A2 is done, A2 refactors to use them.

---

### [A3] Builder Agent
**Phase:** 1 — Starts when A0 merges. Soft dependency on A1 (can stub auth initially).

**Core Responsibility:**
The Lister's private world. Submission, portfolio management, tool health monitoring, onboarding.

**Scope:**
- `/dashboard/onboarding` — multi-step first-time setup (username claim, first tool CTA)
- `/dashboard/profile` — edit `lister_profile`
- `/dashboard/listings` — portfolio overview, status indicators
- `/dashboard/listings/new` — submission wizard (partial-save draft pattern, 4 steps)
- `/dashboard/listings/[id]` — edit draft OR view QA health timeline
- All builder Server Actions: `submitListing`, `updateDraft`, `updateProfile`, `claimUsername`
- Zod schemas for all builder mutations
- Builder UI components: `SubmissionWizard`, `ListingStatusBadge`, `QAHealthTimeline`, `DraftCard`
- `useActionState` + `useFormStatus` integration for all forms

**Does NOT own:**
- The QA run execution (that's A4).
- The taste vote UI (that's A5).
- The voucher wallet (that's A5).

**Oversight:**
- A3 is peer to A1, A2, A4.
- A3 **waits for A1's auth guards** before wiring auth. Can use a stub `requireAuth()` initially.
- A3 reads the QA health timeline from `audit_log` — it renders data written by A4's engine. 
  The contract: A3 queries `audit_log` by `target_type = 'listing'`. A4 writes those rows. No direct coupling.

---

### [A4] Backoffice & QA Engine Agent
**Phase:** 1 — Starts when A0 merges. Soft dependency on A1 for role guards.

**Core Responsibility:**
The operational layer. Admin command center and the automated QA machinery.
Two distinct sub-responsibilities, one agent, because both are low-traffic, high-trust operations.

**Scope — Backoffice:**
- `/backoffice` → `/backoffice/queue` — the prioritized work queue (uses `backoffice_work_queue` view)
- `/backoffice/listings`, `/backoffice/listings/[id]` — full admin view
- `/backoffice/builders` — all lister profiles
- `/backoffice/qa/runs` — QA run history
- All backoffice Server Actions: `approveListing`, `rejectListing`, `openGracePeriod`, `revokeBadge`, `flagTool`, `resolveFlag`
- Taster application review UI (approve/reject applications) — coordination with A5 schema

**Scope — QA Engine:**
- `/api/internal/qa/trigger-batch` — Edge Function, `pg_cron`-scheduled endpoint
- QA check runners: functional (headless browser stub), security (scanner stub)
- Grace period deadline enforcement Edge Function
- `/api/webhooks/*` — incoming webhook handlers (email events)
- Supabase Edge Function deployment configs

**Does NOT own:**
- The taste vote computation (that's a DB trigger written by A0, triggered by A5's vote inserts).
- Any public-facing pages.
- The taster application submission form (that's A5).

**Oversight:**
- A4 is peer to A1, A2, A3.
- A4 writes to `audit_log`. A3 reads from `audit_log`. Contract: documented in `05_ROUTING_AND_APP_CONTRACTS.md`.
- A4's QA Edge Functions trigger DB state machine transitions written by A0. A4 calls functions, not tables directly.

---

### [A5] Community & Rewards Agent
**Phase:** 2 — Starts only after A1 and A3 have merged to `dev`.

**Why the wait?**  
The community layer is builder-adjacent (wallet lives in dashboard) and auth-heavy (Taster identity is everything).
Building on a stable auth layer and a stable dashboard shell avoids rework.

**Core Responsibility:**
The Taster experience end-to-end — application, voting, wallet, redemption.

**Scope:**
- `/apply/taster` — public application form, `taster_applications` INSERT
- `/dashboard/taster` — Taster-only section (gated by `requireTaster()` from A1)
- `/dashboard/taster/vote` — active listings awaiting taste votes (blinded until quorum)
- `/dashboard/taster/wallet` — `taster_wallet` view, voucher list
- `/dashboard/taster/redeem/[voucherId]` — calls `redeem_voucher()` function, shows activation result
- Earn policy enforcement Edge Function — checks taster stats post-vote, issues vouchers
- Taster leaderboard component (public, optional)
- All community Server Actions: `submitTasterApplication`, `castTasteVote`
- All reward Server Actions: `redeemVoucher` (thin wrapper over the DB function)
- UI components: `VoteCard`, `VoucherCard`, `WalletView`, `RedemptionResultModal`

**Does NOT own:**
- Backoffice approval of taster applications (that's A4, who gains this UI during Phase 1).
- The `redeem_voucher` DB function itself (written by A0).

**Oversight:**
- A5 is oversighted by the integration state of `dev` at Phase 2 start.
- Before A5 begins, a designated review of `dev` is required: auth works, dashboard shell is stable, types are accurate.

---

## Oversight Hierarchy

```
A0 (Schema)
  └─► Gates all. No one starts until A0 merges.
  
A1 (Auth & Infra)
  └─► Produces shared contracts (types, guards, clients)
  └─► A3 and A4 soft-depend on A1's outputs
  └─► A5 hard-depends on A1 (Taster identity is auth-critical)

A2, A3, A4
  └─► Peers. No oversight relationship between them.
  └─► Interface via documented read contracts (audit_log, views), not direct coordination.

A5
  └─► Waits for A1 + A3 merge gate.
  └─► Consumes stable dashboard shell from A3.
```

There is no single "tech lead agent" in Phase 1. The schema is the tech lead.
Any conflict between Phase 1 agents is resolved by referring to the architecture documents, not by one agent overruling another.

---

## Branching Strategy

### Branch Topology

```
main
  └── dev  (integration target for all agents)
        ├── feat/a0-schema-foundation
        ├── feat/a1-auth-infra
        ├── feat/a2-catalog-seo
        ├── feat/a3-builder-dashboard
        ├── feat/a4-backoffice-qa-engine
        └── feat/a5-community-rewards
```

### Merge Order & Gates

**Gate 0: Schema merge**
```
feat/a0-schema-foundation → dev

Gate criteria:
  ✓ All migrations run cleanly on a fresh Supabase instance
  ✓ `npx supabase gen types` produces a clean database.types.ts
  ✓ All seed data (system_config) is present
  ✓ All agents review the final types file before Phase 1 begins
```

**Gate 1: Auth merge** *(recommended before other Phase 1 merges, not mandatory)*
```
feat/a1-auth-infra → dev

Gate criteria:
  ✓ npm run build passes
  ✓ Middleware correctly protects /dashboard and /backoffice routes
  ✓ getClaims() wrapper tested against a live Supabase session
```

**Gate 2: Phase 1 parallel merges** *(order within this gate is flexible)*
```
feat/a2-catalog-seo → dev
feat/a3-builder-dashboard → dev
feat/a4-backoffice-qa-engine → dev

Gate criteria (each branch):
  ✓ npm run build passes
  ✓ npm run lint passes
  ✓ No cross-context table access (A3 does not query trust.* tables directly, etc.)
  ✓ All Server Actions use getClaims(), not getSession()
  ✓ Integration smoke test on dev: can submit a listing, can approve it in backoffice
```

**Gate 3: Community merge**
```
feat/a5-community-rewards → dev

Gate criteria:
  ✓ Taster application → approval (A4 UI) → vote → quorum → verdict end-to-end works on dev
  ✓ redeem_voucher() pessimistic lock tested (concurrent redemption attempt must fail gracefully)
  ✓ npm run build passes
```

**Gate 4: Promote to main**
```
dev → main

Gate criteria:
  ✓ Full smoke test on staging Supabase instance (separate from dev DB)
  ✓ RLS audit: attempt cross-user data access, confirm failure
  ✓ npm run build + npm run lint on clean install
```

---

## Conflict Resolution Protocol

**Schema conflicts** (two agents need the same table to be shaped differently):
→ Filed as an issue against A0. A0 writes a new migration. All agents rebase.
Never patch a schema conflict in application code.

**Type conflicts** (an agent's read model doesn't match what the DB actually returns):
→ A0 adjusts the view or A1 adjusts the read-model type. Application code does not patch types with `any`.

**Route conflicts** (two agents accidentally build the same route):
→ Refer to `05_ROUTING_AND_APP_CONTRACTS.md`. The route map is the authority.

**UI component conflicts** (two agents build the same component differently):
→ The first to merge wins. The second agent adopts the merged component. 
No duplicate components for the same UI element.

---

## What Is Not Parallel (And Why)

| Work Item | Why Sequential |
|-----------|---------------|
| Schema (A0) | Everything downstream is typed against it. Parallel work on unstable schema = guaranteed rework. |
| Community (A5) | Builder dashboard shell must be stable. Taster wallet lives inside `/dashboard`. Building A5 inside an unstable shell costs more than the wait. |
| `dev → main` promotion | Requires full integration smoke test. Cannot parallelize a test of the integrated whole. |
