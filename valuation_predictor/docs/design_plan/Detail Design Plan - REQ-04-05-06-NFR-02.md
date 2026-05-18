
---

## Detailed Design Plan: REQ-04 / REQ-05 / REQ-06 / NFR-02 (Landing & Gatekeeping Controls)

## Role

- Lead Frontend Engineer / UI Architect

    - _Responsibility:_ Build the application entry layer — the branding landing page, the mandatory legal disclaimer modal with checkbox gate, and a hard route guard that prevents URL-based bypass of the disclaimer before accessing the wizard.

## Task

- REQ-04 (Landing UI Display): Create a dark-mode landing screen at `/` that displays the PreSeedIQ branding header and a centered "START VALUATION" CTA button.
- REQ-05 (Disclaimer Intercept Modal): When the CTA is clicked, navigate to `/disclaimer` and render a modal overlay containing the exact legal liability text from the PRD. No background interaction is permitted while the modal is displayed.
- REQ-06 (Disclaimer Validation Gate): The "Continue" button inside the disclaimer must be disabled (opacity 40%, cursor not-allowed) until the user explicitly checks the acceptance checkbox. Clicking "Cancel" returns to the landing screen. Once accepted and clicked, navigate to `/step/1`.
- NFR-02 (Forced Trap Usability): The wizard routes (`/step/*`) must be unreachable without first accepting the disclaimer. Direct URL navigation to `/step/1` must redirect back to `/disclaimer` when the acceptance flag is absent.

## Context

- The landing page is the user's first impression of PreSeedIQ. It must feel premium, trustworthy, and clearly communicate the tool's purpose.
- The disclaimer is a hard legal requirement — the PRD mandates verbatim text to comply with cross-border financial promotion regulations. The checkbox gate ensures informed consent.
- Without NFR-02, a user could bookmark `/step/1` or receive a shared link and bypass liability protection entirely. The route guard is the technical enforcement of the legal gate.
- The "START VALUATION" label and button styling (`#E50914` brand accent) are identity elements that carry across all entry points in the application.

## Constraints

- Legal Text Fidelity: The disclaimer body text must match the PRD verbatim — no editing, rewording, or truncation. The exact string is: _"This tool provides an estimated valuation for educational purposes only and does not constitute financial, legal, or investment advice. PreSeedIQ is an estimator, not a definitive valuation. It is a directional decision tool and is not a replacement for investor due diligence."_
- Button Styling: The "START VALUATION" CTA must use `bg-brand-accent` (`#E50914`) with white text, hover transitioning to `bg-muted-highlight` (`#9B050C`). The "Continue" and "Cancel" buttons in the disclaimer must follow the standard Button component variants (primary/secondary).
- Disabled State: The "Continue" button must use `opacity-40 cursor-not-allowed` when `disabled` is true — this matches the Button component's built-in disabled behavior.
- Gate Enforcement: The disclaimer acceptance flag (`preseediq_disclaimer_accepted`) must be stored in `sessionStorage` (alongside form data under the REQ-02/REQ-03 data privacy model). This flag is ephemeral — it does not survive tab close.
- Routing Isolation: The route guard must live in a dedicated component or wrapper (not inline in `App.jsx`) to keep routing logic maintainable. If the flag is absent, redirect to `/disclaimer`.

## Format

The implementation spans four files:

1. **`frontend/src/views/LandingPage.jsx`** — Presentational component: branding header, subtitle, CTA button. No state or data fetching.
2. **`frontend/src/views/Disclaimer.jsx`** — Interactive component: checkbox state, disabled/enabled Continue button, Cancel navigation, acceptance flag write on Continue click.
3. **`frontend/src/views/FormWizard.jsx`** — Route guard insertion: on mount, check for `preseediq_disclaimer_accepted` flag; if absent, redirect to `/disclaimer`.
4. **`frontend/src/components/Button.jsx`** — Shared presentational component (already exists): renders primary/secondary variants with disabled styling. No changes needed.
5. **`frontend/src/App.jsx`** — Route definitions (already exists). No changes needed — guard lives in FormWizard.

## Technical Configuration Maps (Data Structures)

### A. Session Storage Key Extension

```json
{
  "preseediq_disclaimer_accepted": {
    "type": "boolean",
    "written_by": "Disclaimer.jsx Continue onClick",
    "read_by": "FormWizard.jsx mount guard",
    "cleared_by": "purgeUserSession()",
    "survives_navigation": true,
    "survives_tab_close": false
  }
}
```

### B. Component Specifications

#### LandingPage (`/`)

| Element | Content | Styling |
|---------|---------|---------|
| Background | Full-screen | `bg-primary-bg` |
| Header | "PreSeedIQ" | `text-5xl font-bold text-text-primary` |
| Subtitle | "Estimate your startup's valuation range in under 3 minutes." | `text-text-muted` |
| CTA Button | "START VALUATION" | Primary variant (`bg-brand-accent`) → navigates to `/disclaimer` |

#### Disclaimer (`/disclaimer`)

| Element | Content / Behavior |
|---------|-------------------|
| Title | "Disclaimer" — `text-xl font-semibold text-text-primary` |
| Body | Verbatim PRD legal text — `text-text-muted text-sm` |
| Checkbox label | "I understand and accept this disclaimer" |
| Continue | Disabled (`opacity-40 cursor-not-allowed`) when `!accepted`; enabled when `accepted === true`. On click: writes `preseediq_disclaimer_accepted: true` to `sessionStorage`, navigates to `/step/1`. |
| Cancel | Navigates to `/` (landing) |

#### Route Guard (inside FormWizard)

| Trigger | Check | Action |
|---------|-------|--------|
| `FormWizard` mount (`useEffect`) | `sessionStorage.getItem('preseediq_disclaimer_accepted') !== 'true'` | `navigate('/disclaimer', { replace: true })` |

### C. Data Flow

```
User visits /
       ▼
[LandingPage] renders branding + "START VALUATION"
       ▼  Click
/disclaimer
       ▼
[Disclaimer] shows legal text + checkbox
       ▼  Check + Click Continue
sessionStorage.setItem('preseediq_disclaimer_accepted', 'true')
       ▼
/step/1  ───  FormWizard checks flag on mount
       │         Flag present → render step
       │         Flag absent  → redirect to /disclaimer
       ▼
[FormWizard] proceeds normally
```

### D. Buttons Mapping

The Button component already supports the exact styling needed:

| Button | Variant | Disabled Style | Action |
|--------|---------|----------------|--------|
| START VALUATION | `primary` (`bg-brand-accent`) | N/A (always enabled) | `navigate('/disclaimer')` |
| Continue | `primary` | `opacity-40 cursor-not-allowed` | Write flag + `navigate('/step/1')` |
| Cancel | `secondary` (`bg-secondary-surface border-border-default`) | N/A | `navigate('/')` |

## Acceptance Criteria

- AC-01 (Branding Landing Screen — maps to REQ-04): Visiting `/` must render a full-screen dark background with "PreSeedIQ" header text and a "START VALUATION" CTA button.
  - _Verification:_ Mount App in jsdom, assert `screen.getByText('PreSeedIQ')` is visible and `screen.getByText('START VALUATION')` is an enabled `<button>`.
  - _Test Coverage:_ `test_landing_ui_display` (REQ-04).

- AC-02 (Disclaimer Intercept Modal — maps to REQ-05): Clicking "START VALUATION" navigates to `/disclaimer`, which displays the verbatim PRD legal text and renders both "Continue" (disabled) and "Cancel" buttons.
  - _Verification:_ Simulate click on CTA, assert route changes to `/disclaimer`. Assert the legal text block is present. Assert "Cancel" navigates back to `/`.
  - _Test Coverage:_ `test_disclaimer_intercept_modal` (REQ-05, NFR-02).

- AC-03 (Checkbox Gate — maps to REQ-06): The "Continue" button must be `disabled` when the checkbox is unchecked, and become enabled only after the checkbox is checked.
  - _Verification:_ Render Disclaimer, assert `btn.closest('button')` is `disabled`. Click checkbox, assert button is no longer `disabled`. Click Continue, assert `sessionStorage.getItem('preseediq_disclaimer_accepted')` is `'true'` and URL is `/step/1`.
  - _Test Coverage:_ `test_disclaimer_validation_gate` (REQ-06).

- AC-04 (URL Bypass Prevention — maps to NFR-02): Navigating directly to `/step/1` (or any `/step/*` route) without first accepting the disclaimer must redirect to `/disclaimer`.
  - _Verification:_ Clear `sessionStorage`, navigate to `/step/1`, assert URL resolves to `/disclaimer`. Then accept disclaimer, navigate to `/step/1`, assert URL stays at `/step/1`.
  - _Test Coverage:_ `test_disclaimer_intercept_modal` (NFR-02 — "manual deep-linking past this view without interacting with the modal is blocked").

## Implementation Checklist (Current State → Target State)

1. **`frontend/src/views/LandingPage.jsx`** — Already exists and matches spec fully. Verify only.
2. **`frontend/src/views/Disclaimer.jsx`** — Already exists, but needs one addition: write `sessionStorage.setItem('preseediq_disclaimer_accepted', 'true')` inside the Continue `onClick` handler before navigation.
3. **`frontend/src/views/FormWizard.jsx`** — Needs NFR-02 route guard: add a `useEffect` on mount that checks `sessionStorage.getItem('preseediq_disclaimer_accepted')` and redirects to `/disclaimer` if not `'true'`.
4. **`frontend/src/components/Button.jsx`** — Already exists and handles disabled styling correctly (`opacity-40 cursor-not-allowed`). Verify only.
5. **`frontend/src/App.jsx`** — Already exists with correct routes. No changes needed.
6. **`frontend/src/services/session.js`** — `purgeUserSession()` already calls `sessionStorage.clear()`, which wipes the disclaimer flag alongside form data. No changes needed.

---

