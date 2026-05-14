# Agent A2 — Catalog & SEO
**Branch:** `feat/a2-catalog-seo`
**Phase:** 1 (Starts when A0 merges. No dependency on A1 — all your pages are public/unauthenticated.)

---

## Your Job in One Sentence
Build everything a Buyer sees before they log in — the directory, the listing detail, the builder portfolio, and every SEO surface.

## Mandatory Reading
1. `00_DOMAIN_MODEL.md` — understand Listing vs Utility vs Editorial distinction
2. `01_SCHEMA_CONTRACTS.md` — `listing_trust_summary` view is your primary data contract
3. `05_ROUTING_AND_APP_CONTRACTS.md` — your caching contract and full route tree
4. `GEMINI.md` — caching rules, Next.js 15 Zero-Leak Strategy
5. `modern-seo-agent-guide.md` — SEO implementation guide

## Deliverables Checklist

### Pages (all Server Components, all public)
- [ ] `app/page.tsx` — catalog home: browse, search, filter by pricing_model, badges, category
- [ ] `app/[slug]/page.tsx` — listing detail: trust signal display, badges, grace period warning, editorial links, "more from builder" section
- [ ] `app/[username]/page.tsx` — public lister portfolio: profile header + live listings grid
- [ ] `app/utilities/[slug]/page.tsx` — internal utility runner
- [ ] `app/editorial/[slug]/page.tsx` — editorial/review detail

### SEO Infrastructure
- [ ] `app/sitemap.ts` — dynamic, queries all live listings + published editorials + active lister usernames
- [ ] `app/robots.ts`
- [ ] `generateMetadata()` on every page — title, description (from tagline), Open Graph, canonical URL
- [ ] Structured data (JSON-LD `SoftwareApplication` schema on `/[slug]` pages)

### Caching
- [ ] `/[slug]` — `use cache`, key on `slug`. Revalidate on `listing.status` or `listing.qa_status` change.
- [ ] `/[username]` — `use cache`, key on `username`. Revalidate when any listing under this lister goes live.
- [ ] `/editorial/[slug]` — `use cache`, key on `slug`. Revalidate on `editorial.status = 'published'`.
- [ ] `/` (catalog home) — cache with short TTL or ISR. Not personalized.

### Components (all in `src/components/catalog/`)
- [ ] `ListingCard` — props typed as `ListingCard` read-model (from `src/types/read-models.ts`)
- [ ] `BadgeDisplay` — renders active badges from `listing_trust_summary`
- [ ] `TrustSummary` — shows qa_status + grace period warning if applicable
- [ ] `PricingBadge` — free / paid / freemium / contact
- [ ] `ListingGrid` — responsive grid wrapper
- [ ] `ListerProfileHeader` — avatar, name, bio, links, tool count

## Data Access Rules
- Query only via `listing_trust_summary` view for trust data — never join badge tables directly in page code
- Public pages query `status = 'live'` rows only — RLS enforces this, but verify your queries don't bypass it
- Do not call `getClaims()` or `requireAuth()` anywhere in this agent's scope — your pages are public

## Merge Gate
1. `npm run build` passes
2. `npm run lint` passes
3. `generateMetadata()` produces valid OG tags on `/[slug]`
4. Sitemap includes live listings
5. `/[username]` shows only live listings (verify against RLS, not just WHERE clause)
