# SassyMartie: Routing & Application Layer Contracts

> The schema is the foundation. The routing contract is the interface.
> This document defines how the four contexts surface to the world.

---

## Route Tree

```
/                           → Catalog home. Public. Browse all live listings.
/[slug]                     → Listing detail. Public. The trust signal showcase.
/[username]                 → Builder portfolio. Public. Cross-promotion hub.
/utilities/[slug]           → Internal utility runner. Public. No external URL.
/editorial/[slug]           → Editorial detail. Public. Attached to a listing.

/auth/login
/auth/signup
/auth/callback              → Supabase OAuth callback handler

/dashboard                  → Builder private space. Requires auth.
/dashboard/onboarding       → First-time setup. Gated by middleware.
/dashboard/profile          → Edit lister_profile
/dashboard/listings         → Portfolio overview with status indicators
/dashboard/listings/new     → Submission wizard
/dashboard/listings/[id]    → Draft editor OR QA health view (depends on status)

/backoffice                 → Admin command center. Requires backoffice JWT claim.
/backoffice/queue           → The prioritized work queue (default landing)
/backoffice/listings        → All listings, searchable, filterable
/backoffice/listings/[id]   → Full admin view: QA runs, flags, grace periods, audit log
/backoffice/builders        → All lister profiles
/backoffice/qa/runs         → All QA run history

/api/internal/qa/trigger-batch  → Internal Edge Function endpoint. Not public.
/api/webhooks/[provider]        → Incoming webhooks (email events, etc.)
```

---

## Middleware Contract

One middleware. Three decisions.

```
Middleware (runs on every request)
  │
  ├── 1. Refresh session (Supabase SSR cookie dual-write)
  │
  ├── 2. Protect /dashboard routes
  │       IF no valid session → redirect to /auth/login?next=[current_path]
  │       IF valid session BUT onboarding incomplete → redirect to /dashboard/onboarding
  │
  └── 3. Protect /backoffice routes
          IF no valid session → redirect to /auth/login
          IF valid session BUT jwt.role NOT IN ('backoffice_admin', 'backoffice_reviewer')
            → return 403 (not a redirect — deny at the edge)
```

**Onboarding completeness check:**  
`lister_profiles.username IS NOT NULL` is the single gating condition.
The trigger that creates the profile sets username to `null`.
The onboarding step 1 sets it. Simple, queryable, no separate onboarding state table needed.

---

## Caching Contract (Anti-Leak Rules)

| Route                    | Cache Strategy                   | Cache Key                      | Invalidation Trigger                    |
|--------------------------|----------------------------------|--------------------------------|-----------------------------------------|
| `/[slug]` (listing)      | `use cache`, long TTL            | `slug`                         | `listing.status` or `qa_status` change  |
| `/[username]` (portfolio) | `use cache`, medium TTL         | `username`                     | Any listing under this lister goes live |
| `/editorial/[slug]`      | `use cache`, long TTL            | `slug`                         | `editorial.status` = 'published'        |
| `/dashboard/*`           | **NO CACHE**                     | N/A (Server Components, no cache) |                                      |
| `/backoffice/*`          | **NO CACHE**                     | N/A                            |                                        |
| `listing_trust_summary`  | Short TTL (5 min) or realtime    | `listing_id`                   | `badge_grants` or `grace_periods` change |

**The rule:** If the route requires `getClaims()`, it cannot be cached.
If the data is RLS-bound, the cache key must include `auth.uid()`.
Public catalog pages do not use `getClaims()` — they query only public-RLS data.

---

## Type Contract

```
src/
├── types/
│   ├── catalog.ts       → Listing, Utility, Editorial (mirrors DB schema exactly)
│   ├── trust.ts         → QARun, QACheck, Badge, BadgeGrant, GracePeriod
│   ├── builder.ts       → ListerProfile
│   ├── backoffice.ts    → Flag, AuditLogEntry
│   └── read-models.ts   → ListingTrustSummary, ListingCard, BuilderPortfolioItem
│                           (these are the shapes of views, not raw tables)
└── utils/supabase/
    └── database.types.ts  → Auto-generated. NEVER hand-edited.
```

`read-models.ts` is the most important file for application developers.
All components should be typed against read models, not raw table types.
A `ListingCard` component takes a `ListingCard` read-model type, not a raw `Listing` type.
This decouples UI components from schema changes.

---

## Server Action Contract

Every Server Action follows this exact signature pattern:

```typescript
// Pattern: actions/[context]/[verb]-[noun].ts
'use server'

import { z } from 'zod'
import { createServerClient } from '@/utils/supabase/server'

const Schema = z.object({ ... })

export async function verbNoun(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createServerClient()
  const { data: { claims } } = await supabase.auth.getClaims()
  
  if (!claims) return { error: 'Unauthorized' }
  
  const parsed = Schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.flatten() }
  
  const { error } = await supabase
    .from('...')
    .insert({ ...parsed.data, user_id: claims.sub })
  
  if (error) return { error: 'Something broke on our end. Martie is on it.' }
  
  revalidatePath('/...')
  return { success: true }
}
```

**`ActionState` type:**
```typescript
type ActionState = {
  success?: boolean
  error?: string | Record<string, string[]>
  data?: unknown
}
```
