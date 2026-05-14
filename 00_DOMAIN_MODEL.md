# SassyMartie: Domain Model & Bounded Contexts

## The Canonical Taxonomy

Three distinct root aggregates. No blending.

```
Root Aggregates
├── Listing          — External tools. Owned by a Builder (Lister). Has pricing metadata, external URL, QA status.
├── Utility          — Internal tools. Owned by Martie org. Has runtime config, no external URL.
└── Editorial        — Content artifacts. Always *attached* to a Listing via foreign key. Never free-floating.
```

### Why This Matters
A Listing and an Editorial are not the same entity with a flag. They have different ownership models, 
different lifecycle states, different access control requirements, and different routing contracts.
Collapsing them into one polymorphic "content" table is the architectural mistake we are explicitly avoiding.

---

## Bounded Contexts

Four bounded contexts. Each owns its data. No cross-context joins in application code.

```
┌─────────────────────────────────────────────────────────────────┐
│  CATALOG CONTEXT                                                │
│  Owns: listings, utilities, listing_tags, listing_categories    │
│  Responsible for: taxonomy, search index, public browse         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  TRUST CONTEXT                                                  │
│  Owns: qa_runs, qa_checks, badges, badge_grants, grace_periods  │
│  Responsible for: QA engine, badge lifecycle, state machine     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  BUILDER CONTEXT                                                │
│  Owns: lister_profiles, lister_listings (join), submissions     │
│  Responsible for: portfolio, dashboard, submission workflow     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  BACKOFFICE CONTEXT                                             │
│  Owns: admin_users, flags, audit_log, grace_period_overrides    │
│  Responsible for: command center, escalation, god-mode ops      │
└─────────────────────────────────────────────────────────────────┘
```

**Anti-corruption rule:** Cross-context communication happens via well-defined **read models** 
(views or materialized views) and **event contracts** (Postgres triggers → Supabase Realtime), 
never via direct cross-schema joins in application queries.
