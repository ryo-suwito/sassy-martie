# A3: Builder Dashboard — Test Specification

## Unit Tests (Vitest)

### 1. Zod Schemas (`src/lib/schemas/builder/`)
-   **`listerProfileSchema`**
    -   Validate valid usernames (alphanumeric + hyphens).
    -   Reject invalid usernames (spaces, special chars, uppercase).
    -   Validate bio length constraints.
-   **`listingDraftSchema`**
    -   Validate per-step partial data.
    -   Validate full schema for submission (ensure required fields like `pricing_model` are present).

### 2. Server Actions (`src/actions/builder/`)
-   **`claimUsername`**
    -   Verify it rejects unauthenticated calls (mock `getClaims`).
    -   Verify it rejects duplicate usernames.
    -   Verify it updates the correct profile.
-   **`saveDraft`**
    -   Verify it handles both new (Insert) and existing (Update) drafts.
    -   Verify it correctly handles partial data from wizard steps.
-   **`submitListing`**
    -   Verify it blocks submission if the full schema is not valid.
    -   Verify it blocks submission if the listing is not in `draft` status.

## Integration Tests (Playwright/Manual)

### 1. The "Close Tab" Test
1.  Start the Submission Wizard.
2.  Complete Step 1 (Tool Identity).
3.  Observe "Saving..." toast and success.
4.  Close the browser tab.
5.  Reopen and navigate to `/dashboard/listings`.
6.  **Expected:** The draft is present and clicking "Continue" resumes at Step 2.

### 2. Onboarding Gate
1.  Create a new user.
2.  Navigate to `/dashboard`.
3.  **Expected:** Automatic redirect to `/dashboard/onboarding`.
4.  Try to bypass by navigating to `/dashboard/listings`.
5.  **Expected:** Redirect back to `/dashboard/onboarding` until username is claimed.

### 3. QA Timeline Visibility
1.  As a Backoffice user, add a failing QA run and a `grace_period.open` event to a listing's audit log.
2.  As the Lister, view that listing's dashboard page.
3.  **Expected:** The failure and the grace period are visible in the health timeline with correct dates and notes.
