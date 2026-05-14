# SassyMartie Fullstack Developer Guidelines

This document outlines the engineering, design, and copywriting standards for anyone building inside the SassyMartie universe. We are building the premier directory for "Slop As A Service Shop"—a place where builders prove their tools won't steal data, and buyers find reliable indie software. 

Our core philosophy is **feral pragmatism**. We are transparent, anti-corporate slop, and fiercely protective of our users.

---

## 1. Core Philosophy & The Martie Test

Before writing a line of code, designing a UI component, or throwing an exception, apply the **Martie Test**:
> **Would Martie (our chaotic, fiercely protective opossum mascot) say this to a new friend at a hackathon?**

- **If Yes:** Ship it. It feels natural, genuine, and helpful.
- **If No:** Rewrite it. Strip out the corporate language, the passive voice, and the buzzwords. Make it human.

**Engineering Ethos:**
- **Honesty over Hype:** Don't oversell your features in code comments or UI. 
- **Simplicity:** Keep the architecture as straightforward as the brand. If it takes 3 clauses to explain the UX, it's too complex.
- **Transparency:** We sell QA Badges and trust. Our codebase must flawlessly pass the same scrutiny we apply to our customers.

---

## 2. Frontend & UI Engineering

Our frontend is built on a foundation of warm, grounded aesthetics that juxtapose vintage web vibes with modern layout precision.

### Design System & Styling
- **Vanilla CSS Priority:** Utilize CSS Variables (`--red`, `--cream`, `--charcoal`, etc.) as defined in the component guide. Avoid excessive utility classes unless mandated by a framework; keep components focused and reusable.
- **Color Palette:**
  - **Primary:** Brand Red (`#C0392B`), Charcoal (`#2C2C2C`), Cream (`#FAF7F2`)
  - **Accents:** Deep Red (`#922B21`), Coral (`#E8776F`), Peach (`#F5E6D3`)
- **Typography:**
  - Headings/Body: **Georgia** (serif) for a grounded, editorial feel.
  - Metadata/Labels/Tags: **Arial** (sans-serif) for legibility at small sizes.
  - Accents: **Caveat** (cursive) sparingly, for chaotic, human touches.

### Components
- **Buttons:** Must include distinct hover and active/pressed states. Follow the strict hierarchy: Primary (`btn-primary`), Secondary (`btn-secondary`), Ghost (`btn-ghost`), Coral, and Danger.
- **Forms:** Inputs must use the defined focus states (red border with soft shadow). All forms *must* have clear success/error states natively built-in.
- **States:** Implement Empty, Error, Success, and Loading states for *every* data-fetching component. Empty states must use the Peach background (`#F5E6D3`). Loading states use the custom red spinner.

---

## 3. UX & Copywriting in Code

Copy is not an afterthought; it is part of the engineering delivery. Do not use generic system errors.

### Writing Error Messages & Validations
- **DO NOT** use: `"System Error 500"`, `"Invalid input"`, or `"An unexpected error occurred."`
- **DO** use: `"We couldn't save that. Try checking your connection or hit refresh."` or `"That email doesn't look quite right."`

### Tooltips & Onboarding
- **Be Direct:** Short sentences. Say the thing. 
- **Tone by Context:**
  - *Success/Onboarding:* Warm and encouraging ("Hey, glad you're here.").
  - *Error/Failure:* Direct and factual, no jokes ("Something broke on our end. Give us a minute.").
  - *Destructive Actions:* Serious and extremely clear ("This deletes your project permanently.").

---

## 4. Backend Architecture & API Design

Our backend powers the QA Engine. It must be resilient, secure, and state-aware.

### The QA Engine Data Model
- **Badges & Tiers:** The database must support isolated tracking for different QA tiers (Functional, E2E, UI/UX Taste Test, Pen Test). 
- **Grace Period State Machine:** 
  - Ensure background jobs track grace period deadlines (e.g., 48 hours for critical SQLi vulnerabilities, 30 days for low-priority info).
  - Implement clear status flags: `active`, `flagged` (amber warning), `paused` (hidden from directory), and `revoked` (public failure).
  
### API & Webhooks
- Design APIs with strict payload validation. Assume hostile input.
- Webhooks must be verifiable (e.g., HMAC signatures) so builders can securely receive test result summaries.

---

## 5. Security Posture

We test other people's apps for security flaws. **Our house must be fortified.** 

- **OWASP Top 10 Adherence:**
  - **Injection:** Parameterize all SQL queries. No exceptions.
  - **XSS:** Escape all user-generated content on output. Our directory handles arbitrary app descriptions; sanitize them ruthlessly.
  - **CSRF & CORS:** Strictly configure CORS policies to only allow trusted origins. Enforce CSRF tokens on all mutating requests.
  - **Headers:** Implement strict security headers (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`).

---

## 6. Testing & QA Standards

We do not offer a free testing tier. The badge is our product. 

### Automated Testing
- **Playwright & Jest:** Use these tools for functional and End-to-End (E2E) testing. 
  - Tests must cover the full user journey (sign up, onboard, core action, checkout).
- **Security Scanners:** Familiarize yourself with integrating raw JSON/XML outputs from ZAP, Nikto, SQLMap, and Nettacker.
- **AI Report Pipeline:** When handling scanner outputs, your code should format the raw data cleanly so our AI Report Generator can translate it into human-readable severity reports for human reviewers.

### Internal Code QA
- All PRs must pass automated linting and unit tests before merging.
- Any new UI component must be manually verified against the Component Guide for spacing, typography, and responsive behavior before marking a feature complete.
