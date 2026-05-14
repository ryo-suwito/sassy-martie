# Martie's Engineering Rules (SOP)
> "Our house must be fortified. Build like an opossum: scrappy, smart, and fiercely protective."

This document codifies the mandatory architectural and security standards for SassyMartie. These rules take precedence over general defaults.

---

## 1. The Supabase Dual-Client Law
Next.js 15 executes in three places (Browser, Server, Edge). A monolithic client is a failure.
- **Client Components:** Use `createBrowserClient` from `@supabase/ssr`.
- **Server Components/Actions:** Use `createServerClient` with the cookie-handler utility.
- **Middleware:** Use the specialized middleware client to handle session refreshing via `request`/`response` cookie dual-writes.

## 2. Cryptographic Security (The `getClaims` Mandate)
**NEVER** use `supabase.auth.getSession()` in Server Components, Server Actions, or Route Handlers. It relies on cached state and is prone to session leakage.
- **Standard:** Use `supabase.auth.getClaims()`.
- **Why:** It synchronously validates the JWT signature against the project's public keys on every call. Absolute trust, zero caching risk.

## 3. Database Integrity & RLS
We test others; our house must be the fortress.
- **Default:** Every new table must immediately have `ALTER TABLE x ENABLE ROW LEVEL SECURITY;` and `ALTER TABLE x FORCE ROW LEVEL SECURITY;`.
- **No App-Layer Filtering:** `SELECT * FROM tools WHERE user_id = $1` is a safety net, not a security strategy. The RLS policy must be the primary wall.
- **Complexity:** For complex relational checks (e.g., "Can this backoffice user flag this specific lister?"), use `SECURITY DEFINER` functions to cache permission checks and avoid N+1 subqueries in policies.

## 4. Next.js 15 Caching (Zero-Leak Strategy)
Caching RLS-bound data is the #1 source of cross-tenant leaks.
- **Rule:** When using the `use cache` directive or `fetch` caching, the `auth.uid()` **MUST** be part of the cache key.
- **Constraint:** Any data returned from an RLS-bound table must use the user's ID as a hard-coded argument in the fetching function.

## 5. Feral Mutations (Server Actions)
- **Standard:** Use Server Actions (`'use server'`) for all data mutations.
- **Validation:** Use **Zod** for schema validation. Use `safeParse` to avoid unhandled server-side crashes.
- **UX:** Use `useActionState` and `useFormStatus` to handle pending states. No duplicate submissions.
- **Tone:** Use "Martie-fied" error messages. "Something broke on our end" > "Error 500".

## 6. Type Safety & CI/CD
- **Sync:** The `src/utils/supabase/database.types.ts` must be perfectly synced with PostgreSQL.
- **Automation:** Any schema change requires immediate regeneration via `npx supabase gen types`.
- **Audit:** All PRs must pass `npm run build` and `npm run lint` to ensure type integrity.

## 7. Performance & Observability
- **Indexing:** Every column filtered by an RLS policy (usually `user_id`, `id`, `org_id`) **MUST** be indexed.
- **Monitoring:** High-frequency queries must be audited with `EXPLAIN ANALYZE`.

---

**"Ship your slop. Protect your friends. Don't leak the data."** — Martie ♡
