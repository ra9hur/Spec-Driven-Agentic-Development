
1. Backend Test Suite (`backend/tests/`)

`test_engine.py` (Core Mathematical Matrix & Logic Verification)

- **`test_base_valuation_branch_allocation` (REQ-18):**
    - _Specification:_ Asserts that passing specific stage values to the calculation runtime assigns exact baseline numbers: `"Idea"` maps to $1,500,000.00, `"MVP/Prototype Built"` maps to $2,500,000.00, and `"Early Traction"` maps to $4,000,000.00.
- **`test_pillar_modifier_team_logic` (REQ-19):**
    - _Specification:_ Feeds structured mock configurations tracking variable founder metrics into the scoring loop. Asserts a profile with a `"Mixed"` background and `priorExitsOrRelevantExperience=True` evaluates to the maximum upper category cap parameter of `1.5`.
- **`test_pillar_modifier_traction_retention_bonus` (REQ-20):**
    - _Specification:_ Exercises the traction modifier function with a baseline company profile. Confirms that configuring `retentionRatePct = 85.0` triggers the logic gate to cleanly append the explicit modern automated correction factor bonus increment of `+0.15`.
- **`test_pillar_modifier_risk_solo_penalties` (REQ-21):**
    - _Specification:_ Simulates edge cases where risky profiles are ingested. Asserts that configuring either `runwayMonths = 2` or `numberOfFounders = 1` enforces a hard logical ceiling constraint, capping that structural sub-score block directly at `0.5`.
- **`test_mathematical_bounds_engine_guardrails` (REQ-22):**
    - _Specification:_ Passes an exceptionally weak startup configuration and a hyper-inflated traction profile. Asserts the math engine clips execution boundaries perfectly, forcing a hard numerical floor at $500,000.00 and an absolute roof cut-off at $6,500,000.00.
- **`test_output_target_range_division` (REQ-23):**
    - _Specification:_ Asserts that the engine synthesizes outputs into a balanced range array. Validates that the returned data low-bound equals exactly 80% of the computed base valuation (\(V_{final}\)), while the high-bound matches exactly 120%.
- **`test_deterministic_confidence_computation` (REQ-24):**
    - _Specification:_ Feeds variations of complete and incomplete numeric inputs to the function. Validates that a blank metric profile returns a base rating of `70%`, while sequentially populating `monthlyRevenueUSD`, `retentionRatePct`, and `estimatedMarketSizeTAM` raises the score to its absolute hard maximum cap of `95%`.

`test_api.py` (FastAPI Validation, Transport & Lifecycle Verification)

- **`test_pydantic_layer_rejection_handling` (REQ-17):**
    - _Specification:_ Uses FastAPI's `TestClient` to POST malformed JSON Payloads (e.g., negative text variables, letters inside revenue strings, string text inside integer blocks). Asserts the middleware catches the formatting error and returns an HTTP status code `422 Unprocessable Entity`.
- **`test_asynchronous_request_gateway` (REQ-16, NFR-05):**
    - _Specification:_ Despatches a completely valid `ValuationRequest` JSON payload to `/api/v1/calculate`. Asserts the router returns a `200 OK` header, parses a properly keyed output payload structure, and processes the operation within the target backend latency threshold of `<50ms`.
- **`test_ollama_api_transmission` (REQ-25):**
    - _Specification:_ Mocks the upstream Ollama endpoint to intercept transmission tracking. Asserts that the backend constructs a valid prompt payload, dispatches it to the local Ollama API endpoint (`/v1/chat/completions`), and processes the response correctly without requiring any API key or auth headers.
- **`test_ai_fault_tolerant_circuit_breaker` (REQ-26):**
    - _Specification:_ Simulates a hung network transport state by adding an artificial latency block to the outgoing endpoint mock. Asserts the backend catches the latency boundary event, triggering an un-broken exit sequence the moment execution passes the strict **5.0-second timeout deadline**.
- **`test_network_timeout_fallback_execution` (REQ-27, NFR-07, NFR-08):**
    - _Specification:_ Disconnects the external API simulation entirely. Asserts that the router catches the network failure exception gracefully and immediately injects the predefined fallback textual report variables into the client payload data stream, maintaining a system turnaround round-trip execution speed of `<120ms` without exposing the API key secret.

---

2. Frontend Test Suite (`frontend/tests/`)

`Disclaimer.test.jsx` (Gatekeeping UI Component Controls)

- **`test_landing_ui_display` (REQ-04):**
    - _Specification:_ Mounts the application entry tree inside a virtual layout context. Asserts that high-contrast typography displays the title **PreSeedIQ** and confirms that the layout renders a visible primary action selector reading `"START VALUATION"`.
- **`test_disclaimer_intercept_modal` (REQ-05, NFR-02):**
    - _Specification:_ Simulates a pointer click on the initial start button. Asserts that the DOM launches a modal container obscuring the dashboard backdrop and displays the mandatory compliance advisory disclaimer text block. Asserts manual deep-linking past this view without interacting with the modal is blocked.
- **`test_disclaimer_validation_gate` (REQ-06):**
    - _Specification:_ Inspects the structural properties of the modal's primary confirmation action element. Asserts that its HTML attribute tracks as `disabled` by default, and confirms the status clears into an active clickable state only when the user selects the acknowledgment checkbox node.

`FormWizard.test.jsx` (Progressive Step State & Filtering Controls)

- **`test_wizard_layout_flow` (REQ-07, NFR-03, NFR-04):**
    - _Specification:_ Renders the wizard parent tree container. Asserts that layout state shifts handle backwards and forward panel traversal smoothly using `"Back"` and `"Continue"` workflows without purging active form input memory fields.
- **`test_responsive_reflow_constraints` (REQ-08):**
    - _Specification:_ Modifies the virtual testing environment viewport frame down to `375px`. Asserts that the application layout shifts structure, wrapping all multi-column form tables and data cells into clean single-column vertical block strings.
- **`test_form_step_validation_gates` (REQ-09, REQ-10, REQ-11, REQ-12, REQ-13):**
    - _Specification:_ Iteratively tests steps 1 through 5. Simulates input changes across each view boundary, asserting that progression remains locked until all mandatory requirements for that view (e.g., stage dropdowns, TAM inputs, runway values) are completely populated.
- **`test_string_input_filtering_controls` (REQ-14):**
    - _Specification:_ Targets key numeric collection fields (such as _Monthly Revenue_ and _Burn Rate_). Fires keystroke change events containing mix strings (e.g., `"-a105f.2"`). Asserts the form's regex intercept mechanism scrubs inputs dynamically, updating values exclusively to clean numeric sequences (`"105.2"`).
- **`test_input_state_styling_rules` (REQ-33):**
    - _Specification:_ Inspects rendered form elements across all interactive states. Asserts that inputs at rest display `#161616` background with `#262626` border, that focused inputs transition to `#E50914` border with an outer glow, and that disabled elements clamp to 40% opacity with `not-allowed` cursor.
- **`test_submission_trigger_action_ui` (REQ-15):**
    - _Specification:_ Simulates progression forward until the component state indexes onto Step 5. Asserts the navigation panel button text automatically changes from `"Continue"` to read **"CALCULATE VALUATION"**.

`Session.test.jsx` (Data Privacy & Session State)

- **`test_data_security_control` (REQ-02):**
    - _Specification:_ Mounts the form wizard and populates multiple fields across steps. Asserts that the application state is serialized and persisted in `sessionStorage` under a predictable key, and that data survives forward and backward navigation within the same browser session.
- **`test_data_discard_protocol` (REQ-03):**
    - _Specification:_ Simulates a full tab closure or page refresh by reloading the application context. Asserts that `sessionStorage` is cleared and all previously entered form data is absent, confirming zero persistent state survives beyond the active session.

`Dashboard.test.jsx` (Analytical Rendering & Actions)

- **`test_asynchronous_ui_loading_state` (REQ-28):**
    - _Specification:_ Simulates an active API pipeline lookup. Asserts that the page content clears temporarily to present a high-visibility loading animation spinner using Crimson Red design parameters (`#E50914`).
- **`test_three_column_financial_display` (REQ-29):**
    - _Specification:_ Feeds a clean mockup JSON data string into the analytics view. Asserts that the framework creates three separate structural layout blocks tracking **LOW**, **BASE** (rendered in dynamic crimson `#E50914`), and **HIGH** bounds alongside the data confidence string.
- **`test_multi_bar_visual_metrizations` (REQ-30):**
    - _Specification:_ Inspects DOM progress-bar elements mapped to the sub-pillar score vectors. Asserts that individual nodes calculate progress ratios correctly relative to baseline weights and verifies styles apply the correct fill colors.
- **`test_two_column_profile_matrix` (REQ-31, NFR-09):**
    - _Specification:_ Asserts that properties for Strengths and Weaknesses display cleanly inside an explicit, equal-width two-column configuration matrix to prevent the single delivery of an un-explained figure.
- **`test_recommendation_text_engine_block` (REQ-34):**
    - _Specification:_ Feeds a mock API response containing a four-part AI recommendation string into the dashboard renderer. Asserts that the UI parses and displays the strategy block covering Fundraising Readiness, Valuation Expectations, Recommended Actions, and Critical Concerns/Opportunities. Also validates that when the AI circuit breaker triggers, the hardcoded fallback text is rendered instead of an empty or broken state.
- **`test_action_bar_functional_handlers` (REQ-32):**
    - _Specification:_ Programmatically mocks click callbacks on the dashboard footer action controls to ensure event integrity:
        - `"BACK TO FORM"` successfully restores Step 5 form view memory states.
        - `"EXPORT"` hits system layout targets to render custom printable media arrays (verifying **NFR-10** print stylesheet parameters).
        - `"SHARE"` generates an encoded link string directly inside browser clipboard state arrays.
        - `"NEW VALUATION"` clears `sessionStorage` arrays completely and returns routing workflows back to Step 1 of the form wizard.

---