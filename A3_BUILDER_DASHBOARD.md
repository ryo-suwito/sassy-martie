# Agent A3 — Builder Dashboard
**Branch:** `feat/a3-builder-dashboard`
**Phase:** 1 (Starts when A0 merges. Soft dependency on A1 — stub auth guards until A1 merges.)

---

## Your Job in One Sentence
Build the Lister's entire private world — onboarding, submission wizard, portfolio management, and the QA health timeline.

## Mandatory Reading
1. `03_BUILDER_CONTEXT.md` — your primary spec
2. `05_ROUTING_AND_APP_CONTRACTS.md` — canonical Server Action pattern, your route tree
3. `01_SCHEMA_CONTRACTS.md` — `listings`, `lister_profiles` tables
4. `GEMINI.md` — Feral Mutations (Server Actions), getClaims Mandate

## Auth Stub Strategy
A1 may not have merged when you begin. Use this stub in development, then swap when A1 merges:
```typescript
// src/lib/auth/guards.ts (stub — delete when A1 merges)
export async function requireAuth(supabase: any) {
  // Stub: returns mock claims for local dev
  return { sub: 'dev-user-id', role: 'authenticated' }
}
```
**Do not merge to `dev` with the stub in place.** Replace with A1's real implementation before your PR.

## Deliverables Checklist

### Pages
- [ ] `app/dashboard/page.tsx` — redirect to `/dashboard/listings`
- [ ] `app/dashboard/onboarding/page.tsx`
  - Step 1: Claim username + bio (updates `lister_profiles`)
  - Step 2: CTA to submit first tool (links to `/dashboard/listings/new`)
  - Step 3: "Your tool is pending" state (shown after first submission)
- [ ] `app/dashboard/profile/page.tsx` — edit `lister_profile` form
- [ ] `app/dashboard/listings/page.tsx` — portfolio overview, all listings all statuses, status indicators
- [ ] `app/dashboard/listings/new/page.tsx` — 4-step submission wizard
- [ ] `app/dashboard/listings/[id]/page.tsx` — edit form (if `status = 'draft'`) OR QA health timeline (if submitted)

### Server Actions (`src/actions/builder/`)
- [ ] `claim-username.ts` — updates `lister_profiles.username`. Validates slug format via Zod. Unique check.
- [ ] `update-profile.ts` — updates `lister_profiles` fields
- [ ] `save-draft.ts` — upserts `listings` with `status = 'draft'`. Called per wizard step.
- [ ] `submit-listing.ts` — transitions `listings.status: 'draft' → 'pending_review'`. Sets `submitted_at`.
- [ ] `update-draft.ts` — updates draft listing fields. Blocks if `status != 'draft'`.

### Zod Schemas (`src/lib/schemas/builder/`)
- [ ] `listingDraft.ts` — per-step schemas + full schema
- [ ] `listerProfile.ts` — profile update schema

### Components (`src/components/builder/`)
- [ ] `SubmissionWizard` — 4-step form with partial-save per step
- [ ] `ListingStatusBadge` — visual indicator for all 5 listing statuses
- [ ] `QAHealthTimeline` — reads from `audit_log` (target_type = 'listing', filtered actions only)
- [ ] `DraftCard` — listing card in dashboard context (shows draft progress)
- [ ] `OnboardingStep` — reusable step shell

## Critical Data Rule
The QA health timeline reads from `audit_log` with this exact query shape:
```typescript
supabase
  .from('audit_log')
  .select('action, payload, created_at')
  .eq('target_type', 'listing')
  .eq('target_id', listingId)
  .in('action', ['listing.approve', 'listing.reject', 'grace_period.open',
                  'grace_period.close', 'badge.revoke', 'badge.grant'])
  .order('created_at', { ascending: false })
```
A4 writes these rows. You read them. No other coupling between your scopes.

## Merge Gate
1. `npm run build` passes (with A1's real auth, not the stub)
2. `npm run lint` passes
3. Submission wizard partial-save works — close tab mid-wizard, reopen, draft persists
4. `/dashboard/onboarding` correctly gates users without a username
5. All Server Actions use `getClaims()`, validated via Zod with `safeParse`
