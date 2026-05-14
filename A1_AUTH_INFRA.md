# Agent A1 — Auth & Infrastructure
**Branch:** `feat/a1-auth-infra`
**Phase:** 1 (Starts when A0 merges. Recommended to merge before A3/A4 begin wiring auth.)

---

## Your Job in One Sentence
Build the shared plumbing every other agent imports — auth clients, middleware, route guards, and the complete TypeScript type system.

## Mandatory Reading
1. `GEMINI.md` — the Dual-Client Law and getClaims Mandate are your primary spec
2. `05_ROUTING_AND_APP_CONTRACTS.md` — the middleware decision tree and type contract sections
3. `08_AGENT_STAFFING_BILL.md` — understand what A3 and A4 will import from you

## Deliverables Checklist

### Middleware
- [ ] `middleware.ts` (project root)
  - Session refresh via SSR cookie dual-write on every request
  - `/dashboard/*` → require valid session → redirect `/auth/login?next=...` if not
  - `/dashboard/*` → check `lister_profiles.username IS NOT NULL` → redirect `/dashboard/onboarding` if null
  - `/backoffice/*` → require valid session + `jwt.role IN ('backoffice_admin', 'backoffice_reviewer')` → 403 (not redirect) if not

### Auth Utilities (`src/lib/auth/`)
- [ ] `getClaims.ts` — typed wrapper. Returns `claims | null`. Never throws. Uses `supabase.auth.getClaims()`. Never uses `getSession()`.
- [ ] `guards.ts`
  - `requireAuth(supabase)` — calls getClaims, throws redirect to login if null
  - `requireRole(supabase, role)` — requireAuth + jwt role check, throws 403 if insufficient
  - `requireTaster(supabase)` — requireAuth + `tasters.status = 'active'` check

### System Config (`src/lib/config/`)
- [ ] `systemConfig.ts` — typed reader: `getConfig(key: SystemConfigKey): Promise<string>`
  - `SystemConfigKey` is a union type of all known keys (grace_period_hours, taste_quorum_minimum, etc.)

### TypeScript Types (`src/types/`)
- [ ] `catalog.ts` — Listing, Utility, Editorial (mirror schema exactly)
- [ ] `trust.ts` — QARun, QACheck, Badge, BadgeGrant, GracePeriod
- [ ] `builder.ts` — ListerProfile
- [ ] `backoffice.ts` — Flag, AuditLogEntry
- [ ] `community.ts` — TasterApplication, Taster, TasteVote, TasteVerdict
- [ ] `rewards.ts` — RewardItem, Voucher, Redemption, EarnPolicy
- [ ] `read-models.ts` — ListingTrustSummary, ListingCard, BuilderPortfolioItem, TasterWalletItem, BackofficeWorkQueueItem
- [ ] `actions.ts` — `ActionState` type used by all Server Actions

### Auth Pages
- [ ] `/auth/login` — Supabase email+password login form
- [ ] `/auth/signup` — builder intent signup form
- [ ] `/auth/callback/route.ts` — OAuth callback handler, exchanges code for session

## Contract Stability Rule
Once A3 and A4 have started, do not change the signature of:
- `getClaims()` return type
- `requireAuth()`, `requireRole()`, `requireTaster()` signatures
- Any type in `src/types/`

If a type change is required due to a schema correction, coordinate with A3/A4 before committing.

## Merge Gate
1. `npm run build` passes
2. `npm run lint` passes
3. Middleware correctly 403s a request to `/backoffice` with no role claim
4. `requireAuth()` correctly redirects to login in a Server Component
