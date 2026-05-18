
---

## Overview

Startup Valuation Predictor (Product Name: PreSeedIQ) is a web application that helps early-stage founders estimate a startup valuation range by entering structured information about the company, market, team, traction, and financial profile. The product provides a fast, guided, and educational estimate rather than a formal valuation opinion.

The application architecture utilizes a decoupled framework: a high-performance, responsive React.js client interface coupled to an analytical, data-driven Python backend engine. Users input company fundamentals and instantly receive low, base, and high valuation estimates accompanied by score breakdowns, visual confidence indicators, and custom risk insights.

## Problem Statement

Early-stage founders lack an accessible, fast, and structured framework to estimate startup valuation before engaging with investors, advisors, or accelerators. Traditional valuation methods are mathematically opaque and heavily reliant on historical financial metrics, making them difficult to apply to pre-revenue or early-traction entities.

This product translates qualitative strengths and early quantitative performance indicators into a usable baseline valuation range. It is designed explicitly for educational guidance and decision support, not as certified financial, legal, or investment advice.

## Product Goals

- Help early-stage founders generate a fast, plausible valuation range from structured startup data under 3 minutes.
- Show users which directional factors most heavily influence the final valuation output using clear visual analytics to build trust and systemic transparency.
- Provide personalized recommendation copy mapped to the startup's operational stage and core metrics.
- Deliver an intuitive, polished, and spec-driven system optimized for rapid iteration via AI coding tools.

## Non-Goals

- Producing legally binding, investor-approved, IRS-compliant, or audit-grade valuations.
- Replacing professional financial models, legal structures, or fundraising advisory services.
- Supporting complex cap table management, detailed DCF forecasting spreadsheets, or advanced scenario modeling in the MVP phase.
- Serving late-stage or highly customized corporate financial structures in the initial version.

## Scope & Out of Scope

## In-Scope (MVP Phase)

- Fully client-side interactive 5-step form wizard utilizing the dark mode black-and-red design framework.
- React.js frontend interface tracking layout states and form field parameters cleanly.
- Python-powered REST API backend (FastAPI) handling mathematical valuation matrices and calculation rules.
- Results dashboard featuring conditional logic for confidence scoring and dynamic progress-bar charts.
- Ephemeral data cycle architecture locking all tracking parameters strictly to local client `sessionStorage`.
- Local Ollama LLM integration pipeline for generating tailored generative recommendation insights via Python.
- Native browser window print styling hooks mapping the layout to a clean A4 standard page for PDF generation.

## Out of Scope (Future Phases)

- Multi-user registration systems, permanent server-side database storage, accounts, or profile history dashboards.
- Real-time API currency translation layers or localization frameworks for dynamic foreign exchange tracking.
- Cap table management tracking systems, equity dilution calculators, or complex multi-scenario planning arrays.
- Automated extraction of financial records via ledger software integrations (e.g., QuickBooks or Xero APIs).
- Multi-tiered pricing paywalls, subscription models, or payment processing tokens (e.g., Stripe SDK).

## Assumptions, Dependencies, & Risks

## Strategic Assumptions

- User Technical Baseline: Users are familiar with basic venture metrics (e.g., TAM, Burn Rate, Runway) or have those data values ready before beginning the form sequence.
- Infrastructure Optimization: The target users will operate this system predominantly via desktop browsers while reviewing their company data, though the UI will scale responsively down to mobile layouts.

## Critical Dependencies

- Local LLM Availability: The performance of the enhanced recommendation module depends on the local Ollama instance being available and responsive.
- Deterministic Input Schema: The math engine assumes that client-side form controls sanitize inputs completely, blocking letters and negative symbols from reaching calculation loops.

## Technical & Systemic Risks

- Valuation Misinterpretation Risk: Despite clear disclaimer prompts, users may treat the estimated outputs as definitive market valuations during active funding rounds, introducing brand liability.
- Local LLM Availability Risk: If the Ollama service is not running or crashes, the AI recommendation block falls back to hardcoded text without disrupting the user experience.

## Legal Compliances & Data Governance

## Financial Advisory Regulatory Boundary

- Compliance Threshold: The application does not provide investment management advice, accounting validation services, or certified legal opinions. It functions purely as a mathematical simulation platform.
- Liability Isolation: To comply with cross-border financial promotion regulations, the mandatory intercept checkbox screen must lock down form access until explicit agreement conditions are clicked.

## Data Security & Privacy Controls (GDPR / CCPA Alignment)

- Zero PII Footprint: The MVP design completely avoids collecting, caching, or distributing Personally Identifiable Information (PII) or proprietary corporate cap metrics on external network servers.
- Transient Session Control: Because transaction data runs strictly in temporary client browser memory layers and transit backend requests remain stateless, the app avoids triggering regulatory compliance audits under European GDPR or California CCPA definitions.

## UX & Responsive Layout Principles

- Form Fragmentation: Replace long-scrolling data sheets with an explicit, progress-tracked 5-step wizard to lower cognitive strain.
- Responsive Breakpoints: The application layout must target mobile devices natively, wrapping all horizontally arrayed input columns into single-column vertical stacks on viewports smaller than 768px wide.
- Navigation Architecture: Form states must persist when navigating between adjacent panels via the "Back" and "Continue" actions.

## UI System Design Tokens (Black & Red Archetype)

To ensure the dark-mode layout builds identically across all application components, the application must strictly adhere to the following Tailwind CSS / Hex hexadecimal theme token system:

## 1. Core Color Palette Matrix

- Primary Background (Dark Neutral): `#0A0A0A` (Rich Pitch Black)
    
    - _Application:_ Page body backgrounds, form layout wrappers, and baseline structural grids.
    
- Secondary Surface (Card Neutral): `#161616` (Deep Obsidian Gray)
    
    - _Application:_ Multi-step form step blocks, text input boxes, dropdown containers, and dashboard metric panels.
    
- Brand Accent (Primary Red): `#E50914` (High-Vibrancy Tech Crimson)
    
    - _Application:_ Active step progress rings, primary CTA buttons ("START VALUATION"), sliders, active selection rings, and the BASE valuation output value.
    
- Muted Highlight (Secondary Red): `#9B050C` (Deep Velvet Dark Red)
    
    - _Application:_ Button hover states, secondary indicators, and progress bar container fills.
    
- Typography (High Contrast): `#F5F5F7` (Pure Off-White) / `#A1A1AA` (Muted Zinc Silver)
    
    - _Application:_ Primary bold text header tags versus descriptive label text strings.
    

## 2. Input States & Validation Styling Rules

- Default Rest State: Background color `#161616`, thin border outline `#262626`.
- Active Focus State: Smooth transition to an explicit accent outline highlight using `#E50914` with a minimal `0 0 8px rgba(229,9,20,0.4)` outer glow matrix.
- Disabled Form Step State: Opacity levels clamped hard down to `40%`, changing interaction indicators to a strict `not-allowed` mouse-cursor lock state.

## 3. Data Dashboard Progress Bar Color Rules

The 5 factor contribution progress meters on the results screen must use the following color configurations:

- Traction / Team / Market Bars: Fully saturated active fill track mapping directly to Crimson Red `#E50914`.
- Background Unfilled Track: Solid Dark Obsidian Grey `#262626`.

## Data Privacy & Session State

- Ephemeral Storage Layer: All input variables collected during user progression must reside strictly inside client-side local application memory (`sessionStorage`).
- Data Discard Protocol: Closing the browser tab, terminating the session, or triggering a manual page reload must wipe all states completely. No customer financial details are persisted on a backend database in this version.

---

## Core Experience & User Journey Flow

```unset
[ React Client ] ➔ Trigger "Start Valuation"
       ▼
[ Disclaimer Modal ] ➔ Check "Accept" Box ➔ Trigger "Continue"
       ▼
[ Steps 1 - 5 Forms ] ➔ React state validation tracks all user input values
       ▼
[ Form Submission ] ➔ Client issues JSON POST request to Python API Endpoint
       ▼
[ Python Backend ] ➔ Executes hybrid engine math + Ollama AI prompts
       ▼
[ Results Dashboard ] ➔ React parses backend payload JSON to paint UI dashboard elements
```

---

## Functional Requirements

## 1. Landing Screen & Branding

- Branding Identity: Standardized application header text: PreSeedIQ.
- Visual Theme Archetype: High-contrast dark mode UI featuring the explicit Black and Red design tokens.
- Primary Call-To-Action (CTA): A centered, prominent button explicitly labeled "START VALUATION".

## 2. Mandatory Disclaimer Intercept

- The application must intercept progress with a dedicated confirmation panel prior to Step 1 data entry.
- Required System Text: _“This tool provides an estimated valuation for educational purposes only and does not constitute financial, legal, or investment advice. PreSeedIQ is an estimator, not a definitive valuation. It is a directional decision tool and is not a replacement for investor due diligence.”_
- Validation Constraint: The "Continue" element must remain disabled until the checkbox labeled _"I understand and accept this disclaimer"_ is checked. Selecting "Cancel" routes back to the landing view.

## 3. Comprehensive Form Input Collection Specification

## 3.1 Step 1: Basic Information

- Company Name: Required alphanumeric string input.
- Country: Required dropdown selector.
- Industry: Required dropdown selection mapping to predefined market sectors.
- Business Model: Dropdown choice selection restricted to `B2B` or `B2C` options.
- Startup Stage: Dropdown selection restricting inputs to `Idea`, `MVP/Prototype Built`, or `Early Traction`.

## 3.2 Step 2: Traction & Performance

- Monthly Revenue (USD): Numerical text box entry with a fixed custom `$` currency visual indicator anchor.
- Revenue Growth Rate (%): Percentage number entry slot.
- Number of Users or Customers: Positive integer entry selector.
- Growth Type: Dropdown selector populated with `Month-over-Month` and `Year-over-Year` parameters.
- Growth Rate (%): Percentage indicator slot matching selected type metrics.
- Retention Rate (%): Percentage metric slider or numeric selection slot.

## 3.3 Step 3: Market & Industry

- Estimated Market Size - TAM (USD): Numeric scale calculation block.
- Industry Growth Rate: Dropdown mapping values to `Low`, `Moderate`, or `High` trajectories.
- Competitive Intensity: Dropdown sorting categories into `Low`, `Medium`, or `High` competitive environments.

## 3.4 Step 4: Team Profile

- Number of Founders: Integer entry spinner block.
- Founder Background: Dropdown option toggle choosing between `Technical Only`, `Business Only`, or `Mixed` options.
- Prior Exits or Relevant Experience: Plain clickable checkbox element.

## 3.5 Step 5: Financial & Risk

- Burn Rate (USD per Month): Financial input tracker field.
- Runway (Months): Duration integer tracking step.
- Monetization Clarity: Dropdown listing options for `Clear/Validated`, `Hypothetical`, or `Unclear` revenue paths.
- Regulatory or Execution Risk: Dropdown capturing risk designations (`Low`, `Medium`, `High`).
- Submission Action UI: The step panel navigation button label must instantly swap text strings to read "CALCULATE VALUATION".

---

## 4. Core Mathematical Valuation Engine Architecture (Python/FastAPI)

The calculation layer resides completely inside the Python backend context using a deterministic framework blending elements of the Berkus and Scorecard valuation models.

## 4.1 Step 1: Base Valuation Assignment ($V_{base}$)

```python
v_base = 0
stage = data.step1BasicInfo.get("startupStage")

if stage == "Idea":
    v_base = 1500000
elif stage == "MVP/Prototype Built":
    v_base = 2500000
elif stage == "Early Traction":
    v_base = 4000000
```

## 4.2 Step 2: Cumulative Sub-Pillar Scoring Computations

- Team Score Multiplier ($S_{team}$ | Weight = 30%):
    
    - Start Baseline at `1.0`.
    - If Background equals `Mixed`, adjust score to `1.2`.
    - If Background equals `Technical Only` or `Business Only`, set to `1.0`.
    - If Boolean `priorExitsOrRelevantExperience` is True, add an incremental bonus of `+0.3`.
    - Maximum value cap for this category is bounded at `1.5`.
    
- Traction Score Multiplier ($S_{traction}$ | Weight = 30%):
    
    - If Stage equals `Early Traction` AND Monthly Revenue > 0, set baseline to `1.3`.
    - If Stage equals `MVP/Prototype Built`, set baseline to `1.0`.
    - If Stage equals `Idea`, set baseline to `0.5`.
    - Wireframe Correction Factor: If `retentionRatePct` tracks > 80%, inject an additional bonus multiplier adjustment of `+0.15`. Maximum value cap for this category is bounded at `1.5`.
    
- Market Score Multiplier ($S_{market}$ | Weight = 20%):
    
    - If Competitive Intensity tracks `Low`, set baseline to `1.2`.
    - If Competitive Intensity tracks `Medium`, set baseline to `1.0`.
    - If Competitive Intensity tracks `High`, set baseline to `0.6`.
    
- Risk Score Multiplier ($S_{risk}$ | Weight = 20%):
    
    - If Runway tracks $\ge$ 12 months, set score to `1.2`.
    - If Runway tracks between 4 and 11 months, set score to `1.0`.
    - If Runway tracks $\le$ 3 months OR Number of Founders equals 1, penalize score down to `0.5`.
    

## 4.3 Step 3: Synthesis Formula ($V_{final}$)

$$\text{Total Weighted Multiplier } (M) = (S_{team} \times 0.3) + (S_{traction} \times 0.3) + (S_{market} \times 0.2) + (S_{risk} \times 0.2)$$ $$V_{final} = V_{base} \times M$$

## 4.4 Step 4: Strict Operational Boundaries & Guardrails

- Absolute Lower Boundary Floor: $V_{final}$ cannot compute below $500,000 USD.
- Absolute Upper Valuation Ceiling: $V_{final}$ cannot compute above $6,500,000 USD inside this version.

## 4.5 Step 5: Output Range Calculations

- Low Range Output Target: $V_{low} = V_{final} \times 0.80$
- Base Valuation Output Target: $V_{base\_out} = V_{final}$
- High Range Output Target: $V_{high} = V_{final} \times 1.20$

## 4.6 Step 6: Confidence Score Calculation

The system output layout requires a calculated confidence percentage metric.

- Logic: Establish a hard base of `70%`. Add `+5%` for each fields-set containing non-zero numeric data (specifically checking `monthlyRevenueUSD`, `retentionRatePct`, `estimatedMarketSizeTAM`), up to an absolute hard cap of `95%`.

---

## 5. Results Dashboard & Output Interface (React Layout)

The frontend results layout screen will parse the Python JSON payload response to render four structural zones matching the wireframe specification:

## 5.1 Estimated Valuation Range Zone

- Display three clear columns detailing the computed financial outputs: LOW, BASE (styled dynamically in red typography `#E50914`), and HIGH.
- Formats values using thousands (`K`) or millions (`M`) abbreviations (e.g., $163.7K).
- Renders the calculated confidence string directly underneath the values (e.g., "Confidence: 85%").

## 5.2 Factor Contribution Breakdown Zone

- Visualizes the final calculations utilizing 5 distinct horizontal progress bars scaled from 0% to 100%:
    
    - TRACTION Bar % = $(S_{traction} / 1.5) \times 100$
    - MARKET Bar % = $(S_{market} / 1.5) \times 100$
    - TEAM Bar % = $(S_{team} / 1.5) \times 100$
    - FINANCIAL Bar % = Calculated directly from monetization clarity weights.
    - RISK Bar % = $(S_{risk} / 1.5) \times 100$
    

## 5.3 Profile Matrix Breakdown (Strengths vs. Weaknesses)

- Displays an equal-width, two-column grid section:
    
    - STRENGTHS (Left Column): Mapped dynamically to positive form attributes (e.g., _"Strong retention rate of 98%"_).
    - WEAKNESSES & RISKS (Right Column): Mapped to critical data warnings (e.g., _"Solo founder may face execution challenges"_).
    

## 5.4 Recommendation Text Engine Block

- Outlines a four-part textual strategy block populated via the AI parsing module or hardcoded fallbacks structured as follows:
    
    1. Fundraising Readiness
    2. Valuation Expectations
    3. Recommended Actions
    4. Critical Concerns/Opportunities
    

## 5.5 Action Bar Menu Strip

- The absolute base footer of the dashboard screen layout provides 4 specific element controls:
    
    - BACK TO FORM: Re-routes the viewport history directly back to Step 5, retaining all inputs.
    - EXPORT: Initiates native browser print styling to dump clean dashboard summaries to a local system PDF file.
    - SHARE: Compiles configuration code matrices into a shareable link copied directly to system clipboards.
    - NEW VALUATION: Triggers state destruction functions, wipes browser tracking memory arrays cleanly, and re-routes active sessions directly back to Step 1.
    

---

## 6. AI Recommendation Component & Fault-Tolerant Circuit Breaker

- AI Core Integration Layer: Connects to a local Ollama LLM instance (OpenAI-compatible endpoint at `http://localhost:11434/v1/chat/completions`) to generate customized contextual execution reports. The Python backend formats the user prompt parameters and fires requests using `httpx`. The model is configurable via the `OLLAMA_MODEL` environment variable (default `llama3.2`).
- Network Error Handling Circuit Breaker: If the Ollama connection fails due to the service not running, a timeout, or a malformed response, execution triggers fallback code after a strict 5.0-second deadline.
- Backend Fallback Behavior: The Python backend catches the error via a `try/except` block, halts the downstream request, and appends predefined fallback textual summaries into the JSON response payload. This ensures the React interface paints seamlessly without encountering infinite loading spinners or crashing.

---

## Non-Functional Requirements

## 1. Usability & User Friction

- Onboarding Friction Threshold: The application must feel intuitive enough for first-time founders or operators to operate successfully without a tutorial or text tooltips.
- Layout Segmenting: The multi-page wizard must present clearly segmented input cards to lower cognitive load and maintain focus during data entry.

## 2. Trust, Safety, & Transparency

- Mandatory Intercept Sequence: The app must explicitly trap user progression at startup, forcing interaction with the legal disclaimer before initializing any calculation memory arrays.
- Algorithmic Transparency: The results dashboard is prohibited from showing a single, unexplained valuation number. It must visually map and detail the exact mathematical sub-pillar drivers ($S_{team}, S_{traction}$, etc.) to build creator trust.

## 3. Performance & Latency Targets

- Local Math Processing Latency: Pure algorithmic processing of inputs through the valuation scoring equations must execute near-instantly within the browser client context ($<50\text{ms}$).
- Network Asynchronous Flow: While waiting for the Python backend or Ollama AI recommendation payloads to return over the wire, the React UI must execute a smooth loading animation state to keep the interactive workflow responsive.

## 4. Technical Flexibility & Workflow Compatibility

- Modular Engineering Patterns: The system codebase must isolate data collection components (e.g., Team forms, Market metrics) from calculation utilities and network request engines. This design allows iterative UI shifts without breaking core math engines.
- AI Tool Optimization Framework: The application structure, documentation setups, and comments must be fully readable and structured for AI-assisted coding workflows.

## 5. Client-Side Input Validation Rules

- String Filtering Controls: Numeric metric blocks (e.g., Monthly Revenue, Burn Rate, TAM) must filter out and actively reject non-numeric characters or negative input values dynamically.
- Validation State Gates: The "Continue" and "Calculate Valuation" buttons must remain locked and unclickable until all active form field criteria inside that specific step are populated.
- Data Guardrails: The Python backend data parsing pipeline must contain boundary limits to catch incomplete data states or conflicting entries before they feed into the engine, preventing irrational calculations.

---

## Target Technical Landscape

## Frontend Presentation Architecture (React UI Stack)

- Interface Skeleton: Seamlessly constructed standard HTML5 layout patterns fully implemented using utility-first Tailwind CSS frameworks to enforce design tokens.
- State Operations Engine: A modular client-side framework (React.js / Vite) managing progressive input states across the 5 step boundaries.

## Core Logic & Backend Transport (Python API Stack)

- API Routing Architecture: A high-speed Python web framework (FastAPI) running asynchronously to capture data transactions, validate schemas using `Pydantic`, and calculate valuations natively.
- Serverless Deployment Layer: The Python API layer runs as a serverless container or microservice instance (e.g., via AWS Lambda or Vercel Serverless Python Runtimes), keeping Ollama configuration variables safely away from the browser client console.

---

## Success Metrics & Analytic Funnels

To evaluate the operational health and interface efficiency of the system without violating local user privacy rules, the app will monitor anonymized client events using the following specific product funnels:

## Funnel Progression Mechanics

- Disclaimer Conversion Rate: The percentage of landing page visitors who select the acknowledgment checkbox and proceed to Step 1.
- Form Completion Velocity: The median time elapsed from passing Step 1 to clicking the final calculation command in Step 5 (Target Optimization Threshold: < 180 seconds).
- Step Drop-off Friction Tracking: Independent conversion drop percentages tracked across each step boundary to flag ambiguous input fields.

## System Performance Indicators

- Engine Execution Latency: The calculation turnaround duration tracking the network transaction round-trip between React and FastAPI (Target Engine Threshold: < 120ms).
- AI Integration Fallback Activation Rate: The percentage of overall dashboard queries that trigger the 5.0-second circuit breaker and fall back to local rule-based text blocks due to Ollama time-outs or service unavailability.

---

## Form State Data Schema JSON (For Engineering Alignment)

```json
{
  "step1BasicInfo": {
    "companyName": "",
    "countryCode": "",
    "industry": "",
    "businessModel": "B2B",
    "startupStage": "Idea"
  },
  "step2TractionPerformance": {
    "monthlyRevenueUSD": 0,
    "revenueGrowthRatePct": 0,
    "numberOfUsersOrCustomers": 0,
    "growthType": "",
    "growthRatePct": 0,
    "retentionRatePct": 0
  },
  "step3MarketIndustry": {
    "estimatedMarketSizeTAM": 0,
    "industryGrowthRate": "",
    "competitiveIntensity": ""
  },
  "step4Team": {
    "numberOfFounders": 1,
    "founderBackground": "Mixed",
    "priorExitsOrRelevantExperience": false
  },
  "step5FinancialRisk": {
    "burnRateUSDPerMonth": 0,
    "runwayMonths": 0,
    "monetizationClarity": "",
    "regulatoryOrExecutionRisk": ""
  }
}
```

---

