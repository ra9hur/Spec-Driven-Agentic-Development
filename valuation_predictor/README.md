# PreSeedIQ — Startup Valuation Predictor

A web application that helps early-stage founders estimate a startup valuation range by entering structured information about the company, market, team, traction, and financial profile.

> **Disclaimer:** Results are for educational purposes only. They do not constitute financial advice.

## Features

- **5-Step Guided Wizard** — Collects company info, traction, market, team, and financial data
- **Deterministic Valuation Engine** — Weighted scoring model across 4 pillars (Team, Traction, Market, Risk)
- **LOW / BASE / HIGH Range** — With a confidence percentage (70–95%)
- **Factor Contribution Bars** — Visual breakdown of each pillar's score
- **Strengths & Weaknesses Matrix** — Auto-generated profile analysis
- **AI Recommendation** — Optional local LLM integration via Ollama with automatic fallback
- **Session-Based Persistence** — Form data survives page refreshes, auto-cleared on completion
- **Print-Friendly Export** — Clean A4 output with hidden action bar
- **Zero Data Retention** — No database, no tracking, fully ephemeral

## Architecture

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, React Router 6 |
| **Backend** | Python 3.11, FastAPI, Pydantic, httpx |
| **AI Provider** | Ollama (local LLM, optional) |
| **Testing** | Vitest + Testing Library (frontend), pytest + pytest-asyncio (backend) |
| **Data Storage** | None — fully ephemeral (`sessionStorage` only) |

## Project Structure

```
valuation_predictor/
├── README.md
├── environment.yml
├── docs/
│   └── USER_GUIDE.md
├── backend/
│   ├── src/
│   │   ├── main.py         # FastAPI app, CORS, Ollama integration
│   │   ├── schemas.py      # Pydantic request/response models
│   │   └── engine.py       # Deterministic valuation math engine
│   └── tests/
│       ├── test_api.py
│       ├── test_api_comprehensive.py
│       ├── test_engine.py
│       └── test_engine_comprehensive.py
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.js
    ├── src/
    │   ├── components/      # FormInput, Button, ProgressBar, LoadingState
    │   ├── views/           # LandingPage, Disclaimer, FormWizard, Dashboard
    │   │   └── steps/       # Step1–Step5 form components
    │   └── services/        # API client, session utilities
    └── tests/
        ├── Dashboard.test.jsx
        ├── DesignTokens.test.jsx
        ├── Disclaimer.test.jsx
        ├── FormWizard.test.jsx
        ├── LandingPage.test.jsx
        ├── LoadingState.test.jsx
        ├── ProgressBar.test.jsx
        └── Session.test.jsx
```

## Getting Started

### Prerequisites

- **Node.js 18+** and **npm**
- **Conda** (Miniconda or Anaconda)
- **Ollama** (optional, for AI recommendations)

### Backend

```bash
cd backend
conda env create -f ../environment.yml
conda activate preseediq
uvicorn src.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Optional: Ollama AI Integration

Install [Ollama](https://ollama.ai) and pull a model:

```bash
ollama pull llama3.2
```

The backend auto-detects Ollama at `http://localhost:11434`. If unavailable, it falls back to a hardcoded 4-part recommendation text.

Configure via environment variables:

```bash
export OLLAMA_BASE_URL=http://localhost:11434
export OLLAMA_MODEL=llama3.2
```

## Running Tests

### Frontend

```bash
cd frontend
npm run test -- --run
```

### Backend

```bash
conda run -n preseediq python -m pytest backend/tests -v
```

### Build

```bash
cd frontend
npm run build
```

## Valuation Engine

The engine uses a **weighted pillar scoring model**:

| Pillar | Weight | Factors |
|---|---|---|
| **Team** | 30% | Founder count, background mix, prior exits |
| **Traction** | 30% | Revenue, retention rate, startup stage |
| **Market** | 20% | Competitive intensity, industry growth |
| **Risk** | 20% | Runway length, solo-founder penalty |

**Base valuation** is determined by startup stage:

| Stage | Base |
|---|---|
| Idea | $1,500,000 |
| MVP/Prototype Built | $2,500,000 |
| Early Traction | $4,000,000 |

The final valuation is clamped between **$500,000** (floor) and **$6,500,000** (ceiling). The output range is BASE ±20%.

**Confidence** starts at 70% and increases up to 95% based on available data (revenue > 0, retention > 0, TAM > 0).

## API Reference

### `POST /api/v1/calculate`

Accepts a `ValuationRequest` JSON body and returns a `ValuationResponse`.

**Request:**

```json
{
  "step1BasicInfo": {
    "companyName": "Acme AI",
    "countryCode": "US",
    "industry": "SaaS",
    "businessModel": "B2B",
    "startupStage": "MVP/Prototype Built"
  },
  "step2TractionPerformance": {
    "monthlyRevenueUSD": 5000,
    "revenueGrowthRatePct": 15,
    "numberOfUsersOrCustomers": 200,
    "growthType": "Month-over-Month",
    "growthRatePct": 20,
    "retentionRatePct": 85
  },
  "step3MarketIndustry": {
    "estimatedMarketSizeTAM": 1000000000,
    "industryGrowthRate": "High",
    "competitiveIntensity": "Medium"
  },
  "step4Team": {
    "numberOfFounders": 2,
    "founderBackground": "Mixed",
    "priorExitsOrRelevantExperience": true
  },
  "step5FinancialRisk": {
    "burnRateUSDPerMonth": 15000,
    "runwayMonths": 12,
    "monetizationClarity": "Clear/Validated",
    "regulatoryOrExecutionRisk": "Low"
  }
}
```

**Response:**

```json
{
  "valuation": {
    "low": 2000000.0,
    "base": 2500000.0,
    "high": 3000000.0,
    "confidencePct": 85
  },
  "subPillars": {
    "tractionScore": 1.3,
    "marketScore": 1.0,
    "teamScore": 1.5,
    "financialScore": 1.2,
    "riskScore": 1.2
  },
  "profileAnalysis": {
    "strengths": ["Strong balanced founding structure or exit track record verified."],
    "weaknesses": []
  },
  "aiRecommendation": "..."
}
```

## Design Tokens

| Token | Value | Usage |
|---|---|---|
| `primary-bg` | `#0A0A0A` | Page background |
| `secondary-surface` | `#161616` | Card backgrounds |
| `brand-accent` | `#E50914` | Highlights, CTAs, focus rings |
| `muted-highlight` | `#9B050C` | Completed step indicators |
| `border-default` | `#262626` | Borders, dividers |
| `text-primary` | `#F5F5F7` | Primary text |
| `text-muted` | `#A1A1AA` | Secondary text, labels |
| `accent-glow` | `0 0 8px rgba(229, 9, 20, 0.4)` | Focus shadow |

## Requirements Coverage

| ID | Description | Status |
|---|---|---|
| REQ-01 | Design Tokens & Tailwind Configuration | Done |
| REQ-02 | Session Persistence Across Steps | Done |
| REQ-03 | Session Boundary Discard Protocol | Done |
| REQ-04 | Landing Page with Branding | Done |
| REQ-05 | Disclaimer Gate with Checkbox | Done |
| REQ-06 | Route Guard for Form Access | Done |
| REQ-07–15 | 5-Step Wizard with Validation | Done |
| REQ-16–24 | Backend Valuation Engine | Done |
| REQ-25 | Ollama Local AI Prompt Delivery | Done |
| REQ-26 | AI Fault-Tolerant Circuit Breaker | Done |
| REQ-27 | Network Timeout Fallback Execution | Done |
| REQ-28 | Asynchronous UI Loading State | Done |
| REQ-29 | Three-Column Financial Display | Done |
| REQ-30 | Multi-Bar Visual Metrizations | Done |
| REQ-31 | Two-Column Profile Matrix | Done |
| REQ-32 | Action Bar Functional Handlers | Done |
| REQ-33 | Input State Styling Rules | Done |
| REQ-34 | Recommendation Text Engine Block | Done |
| NFR-01 | Privacy-First Data Handling | Done |
| NFR-02 | SEO & Accessibility Baseline | Done |
| NFR-03 | Responsive Layout | Done |
| NFR-04 | Input Validation UX | Done |
| NFR-05 | Engine Performance (<50ms) | Done |
| NFR-06 | Modular Architecture | Done |
| NFR-07 | Ollama Config Isolation | Done |
| NFR-08 | Fallback Turnaround Budget (<120ms) | Done |
| NFR-09 | Transparency Enforcement | Done |
| NFR-10 | Print Output Presentation | Done |

## Test Coverage

| Suite | Tests | Status |
|---|---|---|
| Frontend | 178 | All passing |
| Backend | 74 | All passing |

## License

Educational use only. Not financial advice.
