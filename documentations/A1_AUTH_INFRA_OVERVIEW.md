# Agent A1 — Auth & Infrastructure Documentation

This document outlines the implementation, testing strategy, and technical rationales for the SassyMartie Auth and Infrastructure layer.

## 1. Core Architecture

### The `getClaims` Mandate
As specified in `GEMINI.md`, we strictly avoid `supabase.auth.getSession()` in server contexts. 
- **Implementation**: `src/lib/auth/getClaims.ts` provides a typed wrapper around `supabase.auth.getClaims()`.
- **Rationale**: `getSession()` relies on cached state which can lead to session leakage in high-concurrency or ISR environments. `getClaims()` performs a synchronous cryptographic signature check on every call, ensuring absolute trust.

### Middleware Route Protection
Middleware handles the first line of defense at the edge.
- **Logic**:
  1. Session Refresh: Standard Supabase SSR cookie sync.
  2. `/dashboard/*`: Redirects to `/auth/login` if no session. Enforces `lister_profiles.username IS NOT NULL` (Onboarding Check).
  3. `/backoffice/*`: Redirects to `/auth/login` if no session. Returns `403 Forbidden` if the user lacks the `backoffice_admin` or `backoffice_reviewer` role.
- **Rationale**: Handling these checks at the middleware level prevents unauthenticated requests from even hitting our application server or database for protected routes, reducing load and increasing security.

### Read-Model Pattern
Instead of components consuming raw database types, we use "Read Models" defined in `src/types/read-models.ts`.
- **Implementation**: Types like `ListingCard` and `ListingTrustSummary` mirror the shapes of database views.
- **Rationale**: Decouples UI development from schema normalization. If the underlying tables change but the view remains the same, the UI doesn't break.

---

## 2. Testing Strategy

We use **Vitest** with **jsdom** for fast, isolated unit testing.

### What is Tested
- **Auth Utilities**:
  - `getClaims`: Successful claim extraction, error handling, and null returns for invalid sessions.
  - `guards.ts`: `requireAuth` redirection, `requireRole` enforcement, and `requireTaster` status checks.
- **Middleware**:
  - Session refresh logic.
  - Redirection logic for `/dashboard` (unauthenticated and incomplete onboarding).
  - Role enforcement for `/backoffice` (redirection vs 403 status).
  - Cookie transfer integrity (ensuring session sync during redirects).
- **System Config**:
  - `getConfig`: Database retrieval of operational parameters and fallback/warning logic.

### What is Mocked
- **Supabase Clients**: Both the server-side client (`@/utils/supabase/server`) and the SSR client (`@supabase/ssr`) are mocked to simulate various user states and database responses.
- **Next.js Primitives**:
  - `next/headers`: Mocked `cookies()` for session state.
  - `next/navigation`: Mocked `redirect()` to verify routing behavior without actual navigation.
  - `next/server`: Mocked `NextRequest` and `NextResponse` (including the constructor and static methods) to simulate the Edge environment.

### Rationales for Testing Approach
1. **Isolation**: By mocking the Supabase client and Next.js internals, we test only our business logic. We assume the libraries (Supabase, Next.js) work as documented.
2. **Speed**: Unit tests run in milliseconds without requiring a live database or a running Next.js dev server.
3. **Reproducibility**: Mocks allow us to easily simulate edge cases like "database down," "user record missing," or "JWT role missing" that are harder to trigger in integration tests.

---

## 3. Maintenance

### Type Sync
Whenever the database schema is updated:
1. Run `npx supabase gen types typescript --local > src/utils/supabase/database.types.ts`.
2. Update the corresponding interfaces in `src/types/*.ts` if the public-facing contract changes.

### Adding New Guards
New role-based or status-based guards should be added to `src/lib/auth/guards.ts` using the same pattern as `requireTaster`. 

---
**"Fortified by Martie."**
