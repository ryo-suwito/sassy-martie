# SassyMartie: Architecture Index

*Derived from PROBLEM_STATEMENTS.md. This is the source of truth for system design.*
*Product decisions belong in PROBLEM_STATEMENTS.md. Architecture decisions belong here.*

---

## Document Map

| File | Problem Statement | What It Answers |
|------|------------------|-----------------|
| [00_DOMAIN_MODEL.md](./00_DOMAIN_MODEL.md) | #1 Taxonomy Chaos | What are the root aggregates? Where are the context boundaries? |
| [01_SCHEMA_CONTRACTS.md](./01_SCHEMA_CONTRACTS.md) | All four | What is the exact shape of the database? What are the RLS rules? |
| [02_QA_ENGINE_STATE_MACHINE.md](./02_QA_ENGINE_STATE_MACHINE.md) | #2 Trust Deficit | How does the QA engine work? What is the badge lifecycle? |
| [03_BUILDER_CONTEXT.md](./03_BUILDER_CONTEXT.md) | #3 Fragmented Portfolio | How does the submission flow work? What is the portfolio system? |
| [04_BACKOFFICE_COMMAND_CENTER.md](./04_BACKOFFICE_COMMAND_CENTER.md) | #4 Operational Bottleneck | How do admins manage tools at scale? What is the work queue? |
| [05_ROUTING_AND_APP_CONTRACTS.md](./05_ROUTING_AND_APP_CONTRACTS.md) | All four | What are the routes? What are the caching, type, and action contracts? |
| [06_TASTER_COMMITTEE_SYSTEM.md](./06_TASTER_COMMITTEE_SYSTEM.md) | #2 Trust Deficit (community layer) | How does community-governed taste voting work? Quorum, reputation, incentive scaffolding. |
| [07_VOUCHER_REWARD_SYSTEM.md](./07_VOUCHER_REWARD_SYSTEM.md) | #3 Builder + Community | Non-transferable voucher tokenization. Earn policies, redemption handlers, legal moat. |

---

## Guiding Philosophy (Read This First)

### 1. The DB is the System
Business rules live in the database — in enums, triggers, RLS policies, and `SECURITY DEFINER` 
functions. The application is a rendering layer. If a business rule only exists in 
application code, it is fragile.

### 2. States Over Flags
`listing.status = 'grace_period'` is better than `listing.is_in_grace_period = true`.
Enums force exhaustive handling. Booleans accumulate into combinatorial chaos.

### 3. Read Models Decouple UI from Schema
Components consume *read models* (views, typed shapes), not raw table rows.
Schema changes do not cascade into UI component rewrites if this layer is maintained.

### 4. The Audit Log is Always Written
Every state transition writes to `audit_log`. Non-negotiable. It costs almost nothing.
The cost of *not* having it during a builder dispute is enormous.

### 5. Security is a Default, Not a Feature
RLS on every table. `getClaims()` everywhere auth is needed. `FORCE ROW LEVEL SECURITY` 
on all tables. No app-layer filtering as the primary wall.

---

## What Is NOT In Scope (Intentionally Deferred)

- **Payments / Monetization** for the directory itself (builder subscription, featured listings)
- **User-generated reviews** from buyers (separate editorial trust problem)
- **API for external integrations** (builders querying their own stats)
- **Mobile application**

These are real future problems. They are not this sprint's problems.
Deferring them now means the schema above does not over-engineer for them.
When the time comes, the bounded context model makes it clean to add them.
