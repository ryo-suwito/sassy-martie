# Catalog & SEO: Implementation & Testing Strategy

This document outlines the architectural decisions, testing methodology, and technical rationales for the Catalog & SEO surfaces of SassyMartie.

## 1. Architecture & Data Flow

### Read Models over Raw Tables
As mandated by `05_ROUTING_AND_APP_CONTRACTS.md`, all UI components are typed against **Read Models** defined in `src/types/read-models.ts`.
- **Rationale:** Decouples the UI from the underlying database schema. If a table structure changes, we only update the mapper in the library, not every component.
- **Implementation:** `ListingCardModel`, `ListerProfileModel`.

### Centralized Data Library (`src/lib/catalog.ts`)
- **Rationale:** Encapsulates Supabase query logic and type mapping.
- **Security:** Strictly enforces `status = 'live'` filters to align with RLS policies, providing a secondary layer of data safety.

---

## 2. Testing Strategy

We utilize **Vitest** and **React Testing Library** for a fast, modern testing experience compatible with React 19.

### What is Tested?
1.  **Core Components:**
    - `PricingBadge`: Correct CSS class application based on pricing enum.
    - `BadgeDisplay`: Conditional rendering of trust badges (Functional, Secure, Taste).
    - `TrustSummary`: State machine rendering for QA statuses (Passing, Grace Period, Failing, Revoked).
2.  **Data Library (`catalog.lib`):**
    - Correct mapping of Supabase join results to Read Models.
    - Graceful handling of "not found" states.
    - Complex join logic for Lister Profiles and tool counts.
3.  **SEO Infrastructure:**
    - `sitemap.ts`: Dynamic generation of routes from database content.

### What is Mocked?
- **Supabase Clients:** We mock `createServerClient` and `createBrowserClient` to prevent actual network calls.
- **Database Responses:** We use `vi.fn().mockReturnThis()` chains to simulate the Supabase fluent API.
- **Auth Claims:** `getClaims()` is mocked to return null for these public-facing tests.

---

## 3. Technical Rationales

### Why Vitest?
Vitest provides a seamless experience in Next.js projects, offering better performance than Jest and native ESM support, which is critical for the modern stack used here.

### Why 'use cache' (Conceptual)?
While Next.js 15 features are still evolving, we've implemented listing and portfolio pages with a clear strategy for caching (slug-based keys) as per the **Zero-Leak Strategy**.

### SEO Implementation
- **JSON-LD:** `SoftwareApplication` schema is injected into `/[identifier]` pages (when rendering a listing) to help search engines understand the tool's utility and price.
- **Dynamic Routing:** Combined `[slug]` and `[username]` into a single `/[identifier]` route to resolve Next.js ambiguity at the root level. The page prioritizes listing matches over builder profiles.
- **Dynamic Sitemap:** Prioritizes the Home and Explore pages while ensuring all live listings are discoverable within one hop.

---

## 4. Maintenance Notes
- **Missing Dependencies:** During setup, `@testing-library/jest-dom` and `@testing-library/user-event` were manually added as they were missing from the initial `package.json`.
- **Linting:** Avoid `any` types in data mappers. Use `unknown` with explicit casting to ensure TypeScript strictly validates the boundary between the DB and the App.
