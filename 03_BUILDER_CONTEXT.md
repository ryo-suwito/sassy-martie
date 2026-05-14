# SassyMartie: Builder Context — Lister Dashboard & Portfolio

> Problem #3: The Fragmented Portfolio.
> The builder has scattered micro-SaaS tools. We are their central hub.

---

## The Core Insight

The Lister Dashboard is not a CRUD form. It is a **portfolio management system**.
The primary conversion goal is: get the builder to list their *second* tool, 
because that proves network-effect value to them.

---

## User Journey: First-Time Builder

```
/auth/signup (builder intent)
  └─► Create auth.users record
        └─► Trigger: auto-create lister_profiles record (username = generated slug)
              └─► Redirect to /dashboard/onboarding
                    └─► Step 1: Claim your username + bio
                    └─► Step 2: Submit your first tool
                    └─► Step 3: "Your tool is in review" — set expectation
```

**The onboarding is gated.** You cannot reach `/dashboard` without completing onboarding.
This is enforced at the middleware level, not the page level.

---

## Submission Workflow

A listing submission is a multi-step form, but it persists as a `draft` record at each step.
This is the "partial save" pattern. If the builder closes the tab, their work is not lost.

```
Step 1: Tool Identity
  → name, tagline, external_url, category
  → Creates listing record: status = 'draft'

Step 2: Pricing & Audience
  → pricing_model, target_audience_description
  → Updates existing draft

Step 3: Media & Screenshots
  → Upload to Supabase Storage
  → Store URLs in listing_media table

Step 4: Review & Submit
  → Builder confirms all data
  → status: 'draft' → 'pending_review'
  → Triggers notification to backoffice
```

**Server Action per step.** Each step is a Server Action that validates via Zod 
and returns to the form using `useActionState`. No full-page reloads.

---

## The Portfolio View: `/[username]`

This is the public-facing profile. It is the product's core viral loop.

```
/[username]
├── ListerProfile (header)
│   ├── avatar, display_name, bio, website, twitter
│   └── "X tools listed" — social proof
│
└── ListingGrid
    └── Only listings WHERE status = 'live'
        └── Each card shows:
            ├── name, tagline, pricing_model badge
            └── active_badges (from listing_trust_summary view)
```

**Caching contract:** This page is heavily cached. Cache key MUST include `username` 
but NOT `auth.uid()` because it is public data. Revalidated on `listing.status` change 
via Supabase Realtime → on-demand revalidation.

---

## Dashboard: `/dashboard`

Private. RLS-enforced. Server Component with `getClaims()`.

```
/dashboard
├── /dashboard/listings
│   ├── All listings for this lister (all statuses)
│   └── Status indicators: draft, pending, live, grace_period, failing
│
├── /dashboard/listings/[id]
│   ├── Edit form (if draft)
│   └── QA run history + current check statuses (if submitted)
│
├── /dashboard/listings/new
│   └── The submission wizard
│
└── /dashboard/profile
    └── Edit lister_profile
```

---

## Cross-Promotion: The Network Effect Feature

When a tool goes live, the listing page for *that tool* includes a footer section:

```
"More from [builder_username]"
→ Shows other LIVE listings by the same lister_id
→ Links to the /[username] portfolio page
```

This is implemented as a static section in the listing detail page template.
No extra API call — it is fetched in the same server component that fetches 
the listing, via a single join to lister_profiles and a subquery on listings.
