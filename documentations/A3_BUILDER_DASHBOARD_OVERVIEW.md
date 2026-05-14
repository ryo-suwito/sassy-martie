# A3: Builder Dashboard — Technical Overview

## Architecture

The Builder Dashboard is the private workspace for Listers (builders). It follows the **Feral Mutations** pattern (Server Actions validated by Zod) and the **Supabase Dual-Client Law** (Server Client for data, Browser Client for Realtime if needed).

### Core Components

1.  **Submission Wizard (`SubmissionWizard.tsx`):** A 4-step stateful form that persists drafts to the database at every step. This ensures zero data loss if a builder closes the tab.
2.  **QA Health Timeline (`QAHealthTimeline.tsx`):** A read-only audit log view that surfaces transparency to the builder. It shows exactly when and why their tool's status changed.
3.  **Onboarding Flow (`onboarding/page.tsx`):** A gated experience that ensures every Lister has a unique username before they can access the dashboard.

### Security (The Wall)

-   **RLS:** Every table in the `builder` and `catalog` schemas is protected by Row Level Security. Builders can only `INSERT`, `UPDATE`, or `DELETE` their own listings and profile.
-   **Synchronous Validation:** Every Server Action uses `getClaims()` to validate the JWT signature against the project's public keys. We do not trust cached session state.
-   **Zod Enforcement:** Data is validated at the boundary. No un-sanitized data ever reaches the database layer.

## Data Model Extensions

To support the 4-step wizard, the following extensions were added:
-   `catalog.listings.target_audience_description`: Captures the "Who is this for?" metadata.
-   `catalog.listing_media`: Stores screenshot URLs and other media assets.

## Workflow

1.  **Signup:** User creates an account.
2.  **Onboarding:** User claims a username and bio.
3.  **Drafting:** User starts a new listing. Every step saves a `draft` record.
4.  **Submission:** User reviews and submits. Status transitions to `pending_review`.
5.  **QA:** Backoffice/Automation runs checks. Results appear in the health timeline.
