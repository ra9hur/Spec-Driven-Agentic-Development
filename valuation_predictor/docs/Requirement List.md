
---

## Phase 1: Environment Setup & Data Privacy Foundation

1. REQ-01 (Design Tokens): The system must utilize explicit Tailwind CSS hex tokens for all views: Primary Background (`#0A0A0A`), Secondary Card Surface (`#161616`), Brand Accent Red (`#E50914`), and Muted Highlight Red (`#9B050C`).
2. REQ-02 (Data Security Control): The application must hold all user form inputs strictly inside client-side local application memory (`sessionStorage`).
3. REQ-03 (Data Discard Protocol): Closing the browser tab, terminating the session, or executing a page refresh must wipe the application state completely. No backend database storage is permitted.
4. NFR-01 (Data Secutity Footprint Boundary): To comply with transient data standards (GDPR/CCPA alignment), the engineering stack must completely exclude any persistent server-side caching, relational databases, or data analytics databases.

## Phase 2: Landing & Gatekeeping Controls (Entry Layer)

1. REQ-04 (Landing UI Display): The application root path must present a dark-mode landing interface displaying the branding name PreSeedIQ and a centered action control explicitly reading `"START VALUATION"`.
2. REQ-05 (Disclaimer Intercept Modal): Clicking the start control must intercept the layout sequence and present a modal containing the mandatory legal liability text block defined in the PRD.
3. REQ-06 (Disclaimer Validation Gate): The action control button inside the disclaimer view must remain grayed out and disabled until the user explicitly toggles a checkbox state verifying text acceptance.
4. NFR-02 (Forced Trap Usability): The disclaimer gate must act as a hard runtime boundary; it must be technically impossible to access or bypass the input wizard via manual URL routes without interacting with this modal.

## Phase 3: The 5-Step Progressive Form Wizard (Frontend UI)

1. REQ-07 (Wizard Layout Flow): Data collection must break down across exactly five distinct progressive panels backed by a visual step-progress indicator.
2. REQ-08 (Responsive Reflow Constraints): Layouts must utilize fluid responsive CSS rules, wrapping multi-column form layouts into single vertical column stacks on viewports smaller than 768px.
3. REQ-09 (Step 1 Validation - Basics): Form view 1 must capture _Company Name_, _Country (Dropdown)_, _Industry (Dropdown)_, _Business Model (B2B/B2C)_, and _Startup Stage (Idea / MVP/Prototype Built / Early Traction)_. The "Continue" button must lock until all 5 fields are populated.
4. REQ-10 (Step 2 Validation - Traction): Form view 2 must collect metrics for _Monthly Revenue_, _Revenue Growth Rate_, _Number of Users_, _Growth Type (Month-over-Month / Year-over-Year)_, _Growth Rate_, and _Retention Rate_. Financial input boxes must display a static visual `$` prefix anchor.
5. REQ-11 (Step 3 Validation - Market): Form view 3 must collect _Estimated Market Size (TAM)_, _Industry Growth Rate (Low/Moderate/High)_, and _Competitive Intensity (Low/Medium/High)_.
6. REQ-12 (Step 4 Validation - Team): Form view 4 must collect _Number of Founders (Integer spinner)_, _Founder Background (Technical Only / Business Only / Mixed)_, and _Prior Exits (Checkbox)_.
7. REQ-13 (Step 5 Validation - Financial Risks): Form view 5 must collect _Burn Rate_, _Runway (Months)_, _Monetization Clarity (Clear/Validated / Hypothetical / Unclear)_, and _Regulatory Risk (Low/Medium/High)_.
8. REQ-14 (String Input Filtering Controls): Client-side form input logic must intercept key events and actively reject letters, special characters, or negative signs inside numeric tracking blocks dynamically.
9. REQ-15 (Submission Trigger Action UI): Upon reaching step 5, the primary navigational progression layout element must modify its active text string to read "CALCULATE VALUATION".
10. NFR-03 (Zero-Tutorial Usability Optimization): Interface padding, label spacing, and input layout grouping must align to standard UI patterns so a non-technical founder can pass the 5 steps without external user guidance.
11. NFR-04 (Navigation State Persistence): The wizard state management model must retain form entries across backward and forward step changes, preventing users from losing data if they hit "Back" to adjust an answer.

## Phase 4: Python Backend Ingestion & Processing (Valuation Engine)

1. REQ-16 (Asynchronous Request Gateway): Clicking the calculate trigger must construct a JSON block mirroring the defined Pydantic schema and dispatch it as an HTTP POST request to the Python FastAPI microservice.
2. REQ-17 (Pydantic Layer Rejection Handling): The FastAPI endpoint must execute schema validation checks, returning a standard `422 Unprocessable Entity` response header to the client if any nested parameters violate strict data types.
3. REQ-18 (Base Valuation Branch Allocation - $V_{base}$): The processing engine must assign an initial cash baseline based on the target startup stage string field: _Idea_ = $1.5M, _MVP_ = $2.5M, _Early Traction_ = $4.0M.
4. REQ-19 (Pillar Modifier Logic - Team): The calculation layer must execute the conditional matrix algorithm mapping founder background and exit markers to output a weighted multiplier capped at a maximum value parameter of 1.5.
5. REQ-20 (Pillar Modifier Logic - Traction): The calculator must process runtime performance modifiers, injecting an incremental +0.15 score upgrade if user retention values surpass the 80% mark.
6. REQ-21 (Pillar Modifier Logic - Risk & Solo Penalties): Operational risk calculations must evaluate current runway parameters. If a startup features 1 founder or under 3 months of cash runway, it must apply a severe penalty clamp capping the sub-score to 0.5.
7. REQ-22 (Mathematical Bounds Engine Guardrails): The total synthesized valuation ($V_{final}$) must route through conditional logical floor and ceiling constraints: values under $500,000 must round up to $500,000, and values over $6,500,000 must clip down to $6,500,000.
8. REQ-23 (Output Target Range Division): The final calculated valuation number must parse into a response range array: Low Range ($V_{final} \times 0.80$), Base Range ($V_{final}$), and High Range ($V_{final} \times 1.20$).
9. REQ-24 (Deterministic Confidence Computation): The engine must calculate a starting base data confidence metric of 70%, appending an incremental +5% for each non-zero performance field provided, bounded at a maximum total percentage of 95%.
10. NFR-05 (Backend Logic Performance): Core algorithmic matrix math handling the Berkus/Scorecard equations inside Python must execute synchronously within an infrastructure threshold of $<50\text{ms}$ from request receipt.
11. NFR-06 (Engineering Code Modularity): The backend project structure must isolate validation models (`schemas.py`) and algorithmic calculations from API path routing controllers (`main.py`) to preserve maintainability.

## Phase 5: AI Enhancements & Network Safeguards (Integrations)

1. REQ-25 (Ollama Local AI Prompt Delivery): The backend execution code must structure a payload prompt outlining user inputs and asynchronously transmit the query strings to the local Ollama endpoint at `http://localhost:11434/v1/chat/completions`.
2. REQ-26 (AI Fault-Tolerant Circuit Breaker): The backend transaction call must execute inside an explicit `try/except` wrapper backed by a 5.0-second timeout deadline lock.
3. REQ-27 (Network Timeout Fallback Execution): If the Ollama connection experiences packet drops, fails, or passes the 5.0-second deadline window, the engine must intercept the timeout exception and bundle predefined local fallback text blocks into the payload without throwing a system crash.
4. NFR-07 (Ollama Config Isolation): The `OLLAMA_BASE_URL` and `OLLAMA_MODEL` parameters must be configured via environment variables or `.env` file. No API key is required for local Ollama inference.
5. NFR-08 (Network Turnaround Round-Trip Budget): Total asynchronous latency covering the server roundtrip (including the UI spinner trigger) must evaluate at $<120\text{ms}$ when running on local rule fallbacks.

## Phase 6: Presenting Analytical Results (UI Dashboard)

1. REQ-28 (Asynchronous UI Loading State): While the React client awaits response delivery over the wire, it must invoke a red loading spinner element to keep the layout interactive.
2. REQ-29 (Three-Column Financial Display): The dashboard interface must process the returned payload JSON to paint three layout metric columns clearly tracking the LOW, BASE (highlighted in red hex `#E50914`), and HIGH valuations alongside the confidence rating string.
3. REQ-30 (Multi-Bar Visual Metrizations): The dashboard must map the 5 sub-pillar scores (Traction, Market, Team, Financial, Risk) onto 5 distinct horizontal progress bar track layouts with background unfilled tracks in `#262626`, filling color bars using Crimson Red `#E50914`. The Financial bar percentage must derive from monetization clarity weights.
4. REQ-31 (Two-Column Profile Matrix): Form attributes parsed as drivers must dynamically render inside an equal-width, two-column visual grid split between bulleted list arrays for _Strengths_ and _Weaknesses & Risks_.
5. REQ-32 (Action Bar Functional Handlers): The absolute footer base strip must present four dedicated application control buttons:
    
    - _BACK TO FORM:_ Re-routes the wizard back to Step 5, preserving existing field data.
    - _EXPORT:_ Triggers native browser window print styles mapping the container to an A4 standard page template for clean local PDF exporting.
    - _SHARE:_ Assembles configurations into an encoded URL copy string pushed directly to the user's desktop clipboard.
    - _NEW VALUATION:_ Completely executes a local session clear utility wrapper and routes the active user sequence back to Step 1 of the form wizard.
    
6. NFR-09 (Transparency Enforcement): The dashboard layer must prohibit displaying an isolated single valuation figure. The sub-pillar meters must paint simultaneously to explain _why_ the valuation bounds were generated.
7. NFR-10 (Print Output Presentation Layout): CSS media queries for printing (`@media print`) must hide the Action Bar strip and change background rules from deep neutral black to standard paper white to protect ink saturation during local PDF creation.

## Supplementary Requirements

1. REQ-33 (Input State Styling Rules): Form elements must use `#161616` background with `#262626` borders at rest state, transition to `#E50914` border with a `0 0 8px rgba(229,9,20,0.4)` outer glow on active focus, and clamp to 40% opacity with `not-allowed` cursor when disabled.

2. REQ-34 (Recommendation Text Engine Block): The dashboard must render a 4-part textual strategy block covering Fundraising Readiness, Valuation Expectations, Recommended Actions, and Critical Concerns/Opportunities, populated via the Ollama AI pipeline or hardcoded fallback templates when the AI circuit breaker activates.

---

