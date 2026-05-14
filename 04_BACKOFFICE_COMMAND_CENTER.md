# SassyMartie: Backoffice Command Center

> Problem #4: The Operational Bottleneck.
> At scale, manual management is impossible. The backoffice must be a force multiplier.

---

## The Core Insight

The backoffice is not an admin panel with CRUD tables. It is a **command center** —
an opinionated workflow tool built around the three operational verbs:
**Review, Flag, and Escalate.**

Admins should never be in a state where they don't know what to do next.
The system tells them.

---

## RLS Architecture for Backoffice

Backoffice users are `auth.users` with a `role` claim in their JWT.

```
-- In auth.users metadata:
{ "role": "backoffice_admin" }  OR  { "role": "backoffice_reviewer" }

-- RLS policy pattern:
CREATE POLICY "backoffice_admin_full_access" ON listings
  FOR ALL
  USING (
    (auth.jwt() ->> 'role') = 'backoffice_admin'
  );
```

**Two tiers:**
- `backoffice_reviewer`: Can read all, can update QA checks, cannot revoke badges or close grace periods.
- `backoffice_admin`: Full god-mode. Can execute all state machine transitions.

**SECURITY DEFINER functions** are used for complex permission checks to avoid N+1 
subqueries inside RLS policies. The function checks membership once, the policy calls the function.

---

## The Work Queue: What Admins See First

`/backoffice` renders a prioritized queue, not a list of all tools.

```
Priority 1 — EXPIRING SOON
  → Grace periods WHERE deadline_at < now() + INTERVAL '6 hours'
  → "Act now or this tool's badges are revoked automatically"

Priority 2 — HUMAN REVIEW NEEDED  
  → qa_checks WHERE check_type = 'taste_test' AND result = 'pending'
  → Sorted by qa_run.initiated_at ASC (oldest first)

Priority 3 — NEWLY SUBMITTED
  → listings WHERE status = 'pending_review'
  → Sorted by submitted_at ASC

Priority 4 — FLAGGED
  → flags WHERE resolved_at IS NULL
  → Sorted by severity DESC, created_at ASC
```

This queue is a **read model** — a Postgres view or materialized view that the app queries.
The admin's cognitive load is determined by the product's data model, not by 
endless filtering and sorting in the UI.

---

## Core Admin Actions & Their Contracts

### Action: Approve a Submission
```
listings.status: 'pending_review' → 'live'
listings.published_at = now()
audit_log INSERT: { action: 'listing.approve', actor_id, target_id: listing.id }
→ Trigger: initiate first QA run (triggered_by = 'manual')
```

### Action: Reject a Submission
```
listings.status: 'pending_review' → 'draft'
audit_log INSERT: { action: 'listing.reject', payload: { reason } }
→ Notify builder (Supabase Edge Function → email/notification)
```

### Action: Open a Grace Period (manually, outside of QA)
```
INSERT grace_periods (listing_id, deadline_at = now() + config.grace_period_hours)
listings.qa_status → 'grace_period'
audit_log INSERT: { action: 'grace_period.manual_open', payload: { reason, notes } }
```

### Action: Revoke a Badge
```
badge_grants.revoked_at = now()
badge_grants.revoked_by = actor_id
listings.qa_status → 'failing' (if all badges revoked) OR stay at current state
audit_log INSERT: { action: 'badge.revoke', payload: { badge_code, reason } }
```

### Action: Flag a Tool
```
INSERT flags (listing_id, reason, severity)
audit_log INSERT: { action: 'listing.flag', payload: { severity, reason } }
→ If severity = 'critical': immediately trigger grace_period opening as side effect
```

---

## The Audit Log as the Source of Truth

The audit log is not a debugging tool. It is the **official record** of all admin actions.
Every state transition above results in an audit_log INSERT. No exceptions.

This serves three purposes:
1. **Accountability:** Who did what, when, and why.
2. **Builder communication:** The builder's "tool health timeline" is derived from the audit log.
3. **Dispute resolution:** If a builder contests a badge revocation, the audit log is the evidence.

**The builder-facing health timeline:**
```sql
-- What the builder sees on /dashboard/listings/[id]
SELECT action, payload->>'notes' as message, created_at
FROM audit_log
WHERE target_type = 'listing' AND target_id = $1
  AND action IN ('listing.approve', 'listing.reject', 'grace_period.open', 
                 'grace_period.close', 'badge.revoke', 'badge.grant')
ORDER BY created_at DESC;
```

---

## Builder Communication Protocol

At scale, admins cannot write individual emails. The system generates them.

**Trigger: grace period opened →** Edge Function sends templated email:
> "Hey! Your tool [name] failed a [check_type] check. You have 48 hours to fix it 
> before your badges are revoked. Here's what we found: [notes]"

**Trigger: grace period expired (badges revoked) →** Edge Function sends:
> "Your tool's badges have been revoked. You can resubmit for QA after fixing the issues."

**Trigger: listing approved →** Edge Function sends:
> "Welcome to the directory! Your tool is now live."

All email templates are Supabase Edge Functions calling a transactional email provider 
(Resend or Postmark). Templates are MDX files, not hardcoded strings in function code.
