
---

## Detailed Design Plan: REQ-02 / REQ-03 / NFR-01 (Session State & Data Privacy)

## Role

- Lead Frontend Engineer / Full-Stack Architect

    - _Responsibility:_ Implement the ephemeral client-side session layer that holds all form data in `sessionStorage`, enforces complete data discard on tab close, and ensures zero persistent server-side storage across the entire stack.

## Task

- REQ-02 (Data Security Control): Build a utility module that serializes all 5 wizard-step form inputs into `sessionStorage` on every field change, and deserializes them back on wizard mount so state survives forward/backward navigation.
- REQ-03 (Data Discard Protocol): Ensure that closing the tab, refreshing the page, or clicking "NEW VALUATION" wipes all stored data — both the wizard form data and any submission payload. No data survives the session boundary.
- NFR-01 (Data Security Footprint Boundary): Verify that the backend engine performs no database writes, no persistent caching, and no analytics logging of incoming payloads. The entire data lifecycle is transient.

## Context

- PreSeedIQ collects sensitive operational startup metrics (revenue, burn rate, runway, founder backgrounds). Storing these on a server would trigger GDPR/CCPA compliance obligations.
- By keeping everything in `sessionStorage` (which is tab-scoped and auto-cleared by the browser on tab close), the app avoids regulatory audit requirements entirely.
- The form wizard must allow users to navigate back and forth between steps without losing data — this is the core UX requirement that `sessionStorage` persistence enables.
- The "NEW VALUATION" action bar button must perform a hard reset: wipe all keys and route the user to step 1.

## Constraints

- Storage Boundary: All client state must use `sessionStorage` only. `localStorage` (which survives tab close) is explicitly forbidden.
- Key Namespace: All PreSeedIQ keys in `sessionStorage` must use the `preseediq_` prefix to avoid collisions with other applications on the same origin.
- Serialization Format: All stored values must be serialized via `JSON.stringify` / `JSON.parse`. The utility module must wrap both calls in try/catch to handle edge cases (quota exceeded, corrupted data).
- Backend Statelessness: The FastAPI backend must not import or reference any database driver, cache layer, or file-based persistence. Each `/api/v1/calculate` request is processed in isolation and the response is returned immediately with no side effects.
- GDPR/CCPA Scope: Because no PII is transmitted to the backend and no storage occurs server-side, no data-processing agreement or privacy-impact assessment is required.
- No "Clear Data" Button in Wizard: The only way to clear data during a session is via "NEW VALUATION" on the dashboard. The wizard steps themselves never offer a reset — users navigate back to change fields, preserving all entries.

## Format

The implementation spans three discrete areas:

1. **`frontend/src/services/session.js`** — Single utility module exporting four functions (`saveFormData`, `loadFormData`, `clearFormData`, `purgeUserSession`). This is the sole interface for all session read/write/clear operations.
2. **`frontend/src/views/FormWizard.jsx`** — React component that calls `loadFormData` on mount to hydrate state and `saveFormData` inside a `useEffect` on every state change.
3. **`frontend/src/views/Dashboard.jsx`** — Reads the `preseediq_submit_payload` key on mount; calls `purgeUserSession()` when "NEW VALUATION" is clicked.
4. **`backend/src/`** — All Python source files must be audited for zero database imports, zero file writes, and zero caching middleware.

## Technical Configuration Maps (Data Structures)

### A. Session Storage Key Schema

```json
{
  "preseediq_form_data": {
    "type": "Serialized JSON object — all 5 wizard step fields",
    "written_by": "FormWizard useEffect (every field change)",
    "read_by": "FormWizard useState initializer",
    "cleared_by": "clearFormData() / purgeUserSession()",
    "survives_navigation": true,
    "survives_tab_close": false
  },
  "preseediq_submit_payload": {
    "type": "Serialized ValuationRequest JSON — full 5-step payload",
    "written_by": "Step5Financial buildPayload() + onSubmit",
    "read_by": "Dashboard useEffect (triggers API call)",
    "cleared_by": "purgeUserSession()",
    "survives_navigation": true,
    "survives_tab_close": false
  }
}
```

### B. Utility Module Interface (`session.js`)

```javascript
const STORAGE_KEY = 'preseediq_form_data';

// Serialize current wizard state to sessionStorage
export function saveFormData(data) { ... }

// Deserialize wizard state on mount (returns null if absent)
export function loadFormData() { ... }

// Remove the wizard form data key (used by tests, not by UI directly)
export function clearFormData() { ... }

// Wipe ALL preseediq keys from sessionStorage and redirect to step 1
export function purgeUserSession() {
  sessionStorage.clear();
  window.location.href = '/step/1';
}
```

### C. Integration Points

| Component | Hook / Trigger | Action |
|-----------|---------------|--------|
| `FormWizard.jsx:25` | `useState(() => loadFormData() \|\| {})` | Hydrate form state from session on mount |
| `FormWizard.jsx:33-35` | `useEffect` on `formData` change | Persist to session on every field update |
| `Step5Financial.jsx:37-39` | "CALCULATE VALUATION" onClick | Build full payload and store as `preseediq_submit_payload` |
| `Dashboard.jsx:22-26` | `useEffect` on mount | Read `preseediq_submit_payload`; redirect to step 1 if absent |
| `Dashboard.jsx:143` | "NEW VALUATION" onClick | Call `purgeUserSession()` — clears all keys, routes to `/step/1` |

### D. Backend Statelessness Audit (NFR-01)

| File | Imports / Patterns | Verdict |
|------|-------------------|---------|
| `backend/src/main.py` | `fastapi`, `httpx`, `os` | No database, no caching, no file I/O |
| `backend/src/engine.py` | Pure math — no I/O at all | Stateless by design |
| `backend/src/schemas.py` | `pydantic.BaseModel` only | Schema definitions only — no runtime state |

## Acceptance Criteria

- AC-01 (Form Persistence Across Steps — maps to REQ-02): Populating fields across all 5 wizard steps and navigating forward/backward must retain every value. Refreshing the browser after a full form fill clears all data (session boundary), while simply navigating steps preserves it.
  - _Verification:_ Mount FormWizard, set values on each step, call `sessionStorage.getItem('preseediq_form_data')`, assert the JSON contains all fields. Navigate back and forth, assert values are preserved. Call `purgeUserSession()`, assert key is absent.
  - _Test Coverage:_ `test_data_security_control` (REQ-02).

- AC-02 (Session Boundary Discard — maps to REQ-03): Closing the browser tab, refreshing the page, or triggering "NEW VALUATION" must wipe all `preseediq_*` keys from `sessionStorage`.
  - _Verification:_ Populate form, simulate page reload (new session context), assert `loadFormData()` returns `null`. Click "NEW VALUATION" on dashboard, assert `sessionStorage` is empty and URL resolves to `/step/1`.
  - _Test Coverage:_ `test_data_discard_protocol` (REQ-03), `test_action_bar_functional_handlers` (NEW VALUATION handler under REQ-32).

- AC-03 (Backend Statelessness — maps to NFR-01): The FastAPI backend must process each `/api/v1/calculate` request in complete isolation with zero persistent storage. No database driver, ORM, cache client, or file I/O may be imported or invoked.
  - _Verification:_ Audit all `.py` files in `backend/src/` for `import` statements referencing `sqlite`, `postgres`, `redis`, `mongo`, `shelve`, `dbm`, or any `open()` write patterns. Confirm none exist. Confirm the Docker/process model has no attached volume for persistent data.
  - _Test Coverage:_ Verified across endpoint system design review (no dedicated unit test — architectural invariant).

- AC-04 (Key Namespace Isolation): All PreSeedIQ session keys must use the `preseediq_` prefix to prevent collisions with other applications on the same browser origin.
  - _Verification:_ Search all `.js` / `.jsx` files in `frontend/src/` for `sessionStorage.setItem` and `sessionStorage.getItem` calls. Assert every literal string argument begins with `preseediq_`.
  - _Test Coverage:_ Manual code review (enforced by architectural convention).

---

