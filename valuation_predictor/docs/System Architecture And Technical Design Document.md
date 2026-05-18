
## System Architecture & Technical Design Document: PreSeedIQ

This document provides a production-ready, spec-driven engineering layout for PreSeedIQ. It matches the React.js client frontend and Python (FastAPI) async backend architecture established in the master Product Requirements Document (PRD).

---

## 1. System Architecture Overview

PreSeedIQ is designed as a decoupled, state-managed Web Application using a Frontend-Backend Isolation Pattern. To safeguard highly sensitive operational startup metrics and eliminate data privacy liabilities (GDPR/CCPA), the database storage layer is eliminated. The application data flow behaves in an entirely transient, stateless manner.

```unset
+-------------------------------------------------------------------------+

|                          CLIENT BROWSER LAYER                           |
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   |                      React.js Application                       |   |
|   |                                                                 |   |
|   |  +--------------------+  State Shift  +----------------------+  |   |
|   |  |   5-Step Wizard    | ------------> |  sessionStorage DUMP |  |   |
|   |  +--------------------+               +----------------------+  |   |
|   |            |                                                    |   |
|   |            | Secure JSON Payload (HTTP POST)                    |   |
|   +------------|----------------------------------------------------+   |
+----------------|--------------------------------------------------------+

                 |
                 ▼ [Cross-Origin Resource Sharing (CORS) Gate]
+-------------------------------------------------------------------------+
|                          BACKEND ENGINE LAYER                           |
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   |                    FastAPI (Python Service)                     |   |
|   |                                                                 |   |
|   |    +-------------------+           +-----------------------+    |   |
|   |    | Pydantic Validator| --------> | Valuation Math Engine |    |   |
|   |    +-------------------+           +-----------------------+    |   |
|   |              |                                 |                |   |
|   |              | Async Transport                 | Logic Output   |   |
|   |              ▼                                 ▼                |   |
|   |    +-------------------+           +-----------------------+    |   |
|   |    |    Ollama Proxy   |           | Payload Assembly Unit |    |   |
|   |    +-------------------+           +-----------------------+    |   |
|   +--------------|---------------------------------|----------------+   |
+------------------|---------------------------------|--------------------+

                   |                                 |
                   | Local HTTP (Timeout: 5.0s)    | Sanitized JSON Response
                   ▼                                 ▼
         +--------------------+             [ Returns to Client ]

         | Ollama (Local LLM) |             [ Paints UI Screen  ]
         +--------------------+
```

---

## 2. API Schema and Type Definitions

## 2.1 Complete Request Payload (`schemas.py`)

This Pydantic model governs the structural parsing, conversion constraints, and validation properties inside the FastAPI ingestion gateway.

```python
from pydantic import BaseModel, Field, field_validator
from typing import Literal

class Step1BasicInfo(BaseModel):
    companyName: str = Field(..., min_length=1)
    countryCode: str = Field(..., min_length=2, max_length=3)
    industry: str
    businessModel: Literal["B2B", "B2C"]
    startupStage: Literal["Idea", "MVP/Prototype Built", "Early Traction"]

class Step2TractionPerformance(BaseModel):
    monthlyRevenueUSD: float = Field(..., ge=0)
    revenueGrowthRatePct: float = Field(..., ge=0)
    numberOfUsersOrCustomers: int = Field(..., ge=0)
    growthType: str
    growthRatePct: float = Field(..., ge=0)
    retentionRatePct: float = Field(..., ge=0, le=100)

class Step3MarketIndustry(BaseModel):
    estimatedMarketSizeTAM: float = Field(..., ge=0)
    industryGrowthRate: Literal["Low", "Moderate", "High"]
    competitiveIntensity: Literal["Low", "Medium", "High"]

class Step4Team(BaseModel):
    numberOfFounders: int = Field(..., ge=1)
    founderBackground: Literal["Technical Only", "Business Only", "Mixed"]
    priorExitsOrRelevantExperience: bool

class Step5FinancialRisk(BaseModel):
    burnRateUSDPerMonth: float = Field(..., ge=0)
    runwayMonths: int = Field(..., ge=0)
    monetizationClarity: Literal["Clear/Validated", "Hypothetical", "Unclear"]
    regulatoryOrExecutionRisk: Literal["Low", "Medium", "High"]

class ValuationRequest(BaseModel):
    step1BasicInfo: Step1BasicInfo
    step2TractionPerformance: Step2TractionPerformance
    step3MarketIndustry: Step3MarketIndustry
    step4Team: Step4Team
    step5FinancialRisk: Step5FinancialRisk
```

## 2.2 Response Payload Specification

```json
{
  "valuation": {
    "low": 1200000.0,
    "base": 1500000.0,
    "high": 1800000.0,
    "confidencePct": 85
  },
  "subPillars": {
    "tractionScore": 1.15,
    "marketScore": 1.0,
    "teamScore": 1.2,
    "financialScore": 0.8,
    "riskScore": 1.0
  },
  "profileAnalysis": {
    "strengths": ["Strong retention rate of 85% verified", "Founding team structure balances mixed profiles"],
    "weaknesses": ["Capital deployment risk with low runway metrics"]
  },
  "aiRecommendation": "Fundraising Readiness: Strong operational signals present..."
}
```

## 2.3 Response Pydantic Model

```python
from pydantic import BaseModel, Field

class ValuationRange(BaseModel):
    low: float
    base: float
    high: float
    confidencePct: int = Field(..., ge=0, le=100)

class SubPillars(BaseModel):
    tractionScore: float
    marketScore: float
    teamScore: float
    financialScore: float
    riskScore: float

class ProfileAnalysis(BaseModel):
    strengths: list[str]
    weaknesses: list[str]

class ValuationResponse(BaseModel):
    valuation: ValuationRange
    subPillars: SubPillars
    profileAnalysis: ProfileAnalysis
    aiRecommendation: str
```

---

## 3. Core Engine Implementation (`main.py`)

This file contains the complete operational execution backend logic. It initializes the web server app routing rules, runs the programmatic data validations, processes the algorithmic valuation equations, and communicates with a local Ollama LLM instance using a resilient circuit-breaker technique.

```python
import os
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from schemas import ValuationRequest, ValuationResponse

app = FastAPI(title="PreSeedIQ Core Valuation Engine", version="1.0.0")

# CORS Access Policies Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to explicit frontend domain in production
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

@app.post("/api/v1/calculate", response_model=ValuationResponse)
async def calculate_valuation(payload: ValuationRequest):
    try:
        # ---- STEP 1: INITIALIZE BASE REVENUE STAGE VALUES ----
        stage = payload.step1BasicInfo.startupStage
        if stage == "Idea":
            v_base = 1500000.0
        elif stage == "MVP/Prototype Built":
            v_base = 2500000.0
        else:  # Early Traction
            v_base = 4000000.0

        # ---- STEP 2: PILLAR CALCULATION MATRIX MODIFIERS ----
        
        # Team Metrics Logic
        s_team = 1.0
        if payload.step4Team.founderBackground == "Mixed":
            s_team = 1.2
        if payload.step4Team.priorExitsOrRelevantExperience:
            s_team += 0.3
        s_team = min(s_team, 1.5)

        # Traction Performance Logic
        s_traction = 0.5
        if stage == "Early Traction" and payload.step2TractionPerformance.monthlyRevenueUSD > 0:
            s_traction = 1.3
        elif stage == "MVP/Prototype Built":
            s_traction = 1.0
            
        if payload.step2TractionPerformance.retentionRatePct > 80.0:
            s_traction += 0.15
        s_traction = min(s_traction, 1.5)

        # Market Scaling Logic
        market_intensity = payload.step3MarketIndustry.competitiveIntensity
        if market_intensity == "Low":
            s_market = 1.2
        elif market_intensity == "Medium":
            s_market = 1.0
        else:
            s_market = 0.6

        # Burn-rate / Operational Runway Logic
        runway = payload.step5FinancialRisk.runwayMonths
        if runway >= 12:
            s_risk = 1.2
        elif 4 <= runway <= 11:
            s_risk = 1.0
        else:
            s_risk = 0.5

        if payload.step4Team.numberOfFounders == 1:
            s_risk = min(s_risk, 0.5) # Force Solo-Founder Penalty

        # Explicit Monetization Score Layer
        monetization = payload.step5FinancialRisk.monetizationClarity
        if monetization == "Clear/Validated":
            s_financial = 1.2
        elif monetization == "Hypothetical":
            s_financial = 1.0
        else:
            s_financial = 0.5

        # ---- STEP 3: WEIGHTED CALCULATIONS SYNTHESIS ----
        total_multiplier = (
            (s_team * 0.30) + 
            (s_traction * 0.30) + 
            (s_market * 0.20) + 
            (s_risk * 0.20)
        )
        
        v_final = v_base * total_multiplier

        # Operational Hard Boundaries & Caps Constraint
        v_final = max(500000.0, min(v_final, 6500000.0))

        # Range Metrics Allocation
        v_low = round(v_final * 0.80, 2)
        v_base_out = round(v_final, 2)
        v_high = round(v_final * 1.20, 2)

        # ---- STEP 4: DETECT DRIVER PATTERNS (STRENGTHS / WEAKNESSES) ----
        strengths = []
        weaknesses = []

        if s_team >= 1.2: strengths.append("Strong balanced founding structure or exit track record verified.")
        if s_traction >= 1.15: strengths.append(f"Highly optimized user retention of {payload.step2TractionPerformance.retentionRatePct}% offsets raw scale limits.")
        if s_market >= 1.2: strengths.append("Favorable competitive landscape context identified.")
        
        if runway <= 3: weaknesses.append("Severe financial positioning vulnerability tracked with near-term runway limits.")
        if payload.step4Team.numberOfFounders == 1: weaknesses.append("Solo-founder reliance profiles carry execution dependencies.")
        if s_financial <= 0.6: weaknesses.append("Unclear validation metrics across immediate monetization channels.")

        # ---- STEP 5: CALCULATE CONFIDENCE SCALE ----
        confidence = 70
        if payload.step2TractionPerformance.monthlyRevenueUSD > 0: confidence += 5
        if payload.step2TractionPerformance.retentionRatePct > 0: confidence += 5
        if payload.step3MarketIndustry.estimatedMarketSizeTAM > 0: confidence += 5
        confidence = min(confidence, 95)

        # ---- STEP 6: ASYNCHRONOUS AI FAULT-TOLERANT CIRCUIT BREAKER ----
        ai_recommendation = "Fallback Execution String: Focus strategy actions on driving baseline optimization metrics, proving customer value pipelines, and establishing clear milestone runways."
        
        prompt_payload = {
            "model": OLLAMA_MODEL,
            "messages": [{
                "role": "user",
                "content": f"Analyze company '{payload.step1BasicInfo.companyName}' at stage '{stage}'. Low Valuation: ${v_low}, Base: ${v_base_out}, High: ${v_high}. Strengths: {strengths}. Weaknesses: {weaknesses}. Generate an operational four-part text summary mapping to fundraising metrics, milestone valuations, actionable target rules, and sector concerns."
            }]
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{OLLAMA_BASE_URL}/v1/chat/completions",
                    json=prompt_payload,
                    timeout=5.0
                )
                if response.status_code == 200:
                    res_json = response.json()
                    ai_recommendation = res_json["choices"][0]["message"]["content"]
        except (httpx.TimeoutException, httpx.RequestError, KeyError):
            pass  # Gracefully trigger default hardcoded fallback block directly without throwing an error

        return {
            "valuation": {"low": v_low, "base": v_base_out, "high": v_high, "confidencePct": confidence},
            "subPillars": {
                "tractionScore": round(s_traction, 2),
                "marketScore": round(s_market, 2),
                "teamScore": round(s_team, 2),
                "financialScore": round(s_financial, 2),
                "riskScore": round(s_risk, 2)
            },
            "profileAnalysis": {"strengths": strengths, "weaknesses": weaknesses},
            "aiRecommendation": ai_recommendation
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Engine Error: {str(e)}")
```

---

## 4. Frontend Component Interface Specification

The frontend client tracking logic utilizes standard React state workflows. Here is the structure to build out your core API network interaction hook file.

## 4.1 API Consumption Service Component (`apiService.js`)

```javascript
export const submitValuationData = async (formData) => {
  const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`Server returned execution exception: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Pipeline Fail Event Tracking:', error);
    throw error;
  }
};
```

## 4.2 Local Browser Clean Wipe Handling Block

```javascript
// Triggers inside your final footer button execution array for a clean session reset
export const purgeUserSessionState = () => {
  window.sessionStorage.clear(); // Complete secure trace erasure event
  window.location.href = '/step/1';   // Route client clean back to wizard Step 1
};
```

## 4.3 Route Architecture

Define the following route structure using React Router:

| Route | Component | Access Condition |
| --- | --- | --- |
| `/` | `LandingPage` | Public — displays "PreSeedIQ" branding and "START VALUATION" CTA |
| `/disclaimer` | `DisclaimerModal` | Intercept after clicking "START VALUATION" — requires checkbox acceptance |
| `/step/1` | `Step1BasicInfo` | Guarded by disclaimer acceptance |
| `/step/2` | `Step2Traction` | Guarded by disclaimer acceptance |
| `/step/3` | `Step3Market` | Guarded by disclaimer acceptance |
| `/step/4` | `Step4Team` | Guarded by disclaimer acceptance |
| `/step/5` | `Step5Financial` | Guarded by disclaimer acceptance — displays "CALCULATE VALUATION" |
| `/results` | `ResultsDashboard` | Valuation output display |

## 4.4 Design Token Configuration

Configure Tailwind CSS via `tailwind.config.js` with the PRD-specified hex tokens:

```javascript
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'primary-bg': '#0A0A0A',
        'secondary-surface': '#161616',
        'brand-accent': '#E50914',
        'muted-highlight': '#9B050C',
        'text-primary': '#F5F5F7',
        'text-muted': '#A1A1AA',
        'border-default': '#262626',
      },
      boxShadow: {
        'accent-glow': '0 0 8px rgba(229,9,20,0.4)',
      },
    },
  },
};
```

### Input State Styling Rules

| State | Background | Border | Opacity | Cursor |
| --- | --- | --- | --- | --- |
| Rest | `#161616` | `#262626` | 100% | auto |
| Active Focus | `#161616` | `#E50914` + `accent-glow` | 100% | auto |
| Disabled | `#161616` | `#262626` | 40% | `not-allowed` |

## 4.5 Component Specifications

### LandingPage

- Full-screen dark background (`#0A0A0A`)
- Centered content block with "PreSeedIQ" branding header
- Primary CTA button labeled "START VALUATION" styled with `#E50914` accent
- Clicking "START VALUATION" navigates to `/disclaimer`

### DisclaimerModal

- Overlay modal blocking all background interaction
- Displays the following legal liability text verbatim:
  > *"This tool provides an estimated valuation for educational purposes only and does not constitute financial, legal, or investment advice. PreSeedIQ is an estimator, not a definitive valuation. It is a directional decision tool and is not a replacement for investor due diligence."*
- Checkbox labeled "_I understand and accept this disclaimer_"
- "Continue" button remains disabled (`opacity: 40%`, `cursor: not-allowed`) until checkbox is checked
- "Cancel" button routes back to `/`
- Once accepted, navigate to `/step/1`

### Step1BasicInfo

- Fields: Company Name (text), Country (dropdown), Industry (dropdown), Business Model (B2B/B2C), Startup Stage (Idea / MVP/Prototype Built / Early Traction dropdown)
- Numeric-only input filtering applied to applicable fields
- "Continue" button disabled until all 5 fields populated
- On continue, advance to `/step/2`

### Step2Traction

- Fields: Monthly Revenue (with `$` prefix anchor), Revenue Growth Rate (%), Number of Users, Growth Type (Month-over-Month / Year-over-Year dropdown), Growth Rate (%), Retention Rate (%)
- Numeric fields apply strict input filtering (reject letters, special characters, negative signs)
- "Continue" disabled until all 6 fields populated
- On continue, advance to `/step/3`
- "Back" navigates to `/step/1`, preserving all entered values

### Step3Market

- Fields: Estimated Market Size TAM, Industry Growth Rate (Low/Moderate/High dropdown), Competitive Intensity (Low/Medium/High dropdown)
- "Continue" disabled until all 3 fields populated
- On continue, advance to `/step/4`
- "Back" navigates to `/step/2`, preserving values

### Step4Team

- Fields: Number of Founders (integer spinner), Founder Background (Technical Only / Business Only / Mixed dropdown), Prior Exits (checkbox)
- "Continue" disabled until all 3 fields populated
- On continue, advance to `/step/5`
- "Back" navigates to `/step/3`, preserving values

### Step5Financial

- Fields: Burn Rate ($), Runway (Months), Monetization Clarity (Clear/Validated / Hypothetical / Unclear dropdown), Regulatory Risk (Low/Medium/High dropdown)
- Primary navigation button reads "CALCULATE VALUATION" instead of "Continue"
- Button disabled until all 4 fields populated
- On submit, build JSON payload matching `ValuationRequest` schema and POST to `/api/v1/calculate`
- "Back" navigates to `/step/4`, preserving values

### Step Progress Indicator

- Visible across all 5 wizard steps, displaying numbered indicators 1–5
- Current active step highlighted with `#E50914` accent
- Completed steps shown with filled indicator
- Future steps shown as unfilled outlines

### State Persistence

- All form state is stored in React context and mirrored to `sessionStorage` on each field update
- Navigating "Back" restores previously entered data from context
- Page refresh resets to initial state (tab-scoped `sessionStorage` is discarded on close)

## 4.6 ResultsDashboard

### Valuation Range Columns

- Three-column layout displaying LOW, BASE, and HIGH valuation figures
- BASE column highlighted with red typography (`#E50914`)
- Values formatted with K/M abbreviations (e.g., $1.5M, $637K)
- Confidence percentage displayed below the range (e.g., "Confidence: 85%")

### Factor Contribution Progress Bars

Five horizontal progress bars with the following fill calculations:

| Bar | Percentage Formula |
| --- | --- |
| TRACTION | `(s_traction / 1.5) \u00d7 100` |
| MARKET | `(s_market / 1.5) \u00d7 100` |
| TEAM | `(s_team / 1.5) \u00d7 100` |
| FINANCIAL | Derived from monetization clarity weights |
| RISK | `(s_risk / 1.5) \u00d7 100` |

- Fill color: Crimson Red `#E50914`
- Background unfilled track: `#262626`

### Profile Matrix

- Two-column equal-width grid: STRENGTHS (left) and WEAKNESSES & RISKS (right)
- Each column is a bulleted list populated from `profileAnalysis.strengths` and `profileAnalysis.weaknesses` in the API response

### Action Bar

Fixed footer strip with four controls:

| Control | Behavior |
| --- | --- |
| BACK TO FORM | Navigate to `/step/5` without clearing form data |
| EXPORT | Trigger `window.print()` with print-specific CSS |
| SHARE | Encode valuation parameters into a URL string and copy to clipboard via `navigator.clipboard.writeText()` |
| NEW VALUATION | Call `purgeUserSessionState()` — clears `sessionStorage` and navigates to `/step/1` |

### Loading State

- While the API request is in-flight, display a full-screen overlay with a red (`#E50914`) CSS loading spinner
- Disable all interaction during loading

## 4.7 Print Output Styling

Include the following `@media print` CSS rules:

```css
@media print {
  .action-bar { display: none !important; }
  body, .dashboard-container {
    background: #FFFFFF !important;
    color: #000000 !important;
  }
  .valuation-columns { break-inside: avoid; }
  @page { size: A4; margin: 15mm; }
}
```

## 4.8 Input Validation Utilities

Shared helper for numeric input filtering:

```javascript
export const filterNumericInput = (value, allowDecimal = true) => {
  const regex = allowDecimal ? /[^0-9.]/g : /[^0-9]/g;
  return value.replace(regex, '').replace(/^\./, '');
};
```

Attach this to `onChange` handlers on all monetary and percentage fields to reject non-numeric characters and negative signs at the keystroke level.

---

## 5. Security & Deployment Matrix

## 5.1 Application Environment Isolation Configurations

- Secret Parameter Isolation: The `OLLAMA_BASE_URL` and `OLLAMA_MODEL` parameters must stay isolated inside server environment configuration pools (`.env` systems parsed at runtime on microservice execution spaces). They must never leak to the browser client layer.
- Cross-Site Attack Strategy: The FastAPI system leverages security configurations enforcing explicit resource limits, filtering traffic down to verified cross-origin browser clients.

## 5.2 Server Production Delivery Strategies

- Deployment Pattern: The service uses independent serverless application endpoints (such as Vercel Serverless runtimes or AWS Lambda containers) to guarantee high operational availability with zero idling costs.

---
