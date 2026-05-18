# PreSeedIQ — User Guide

## What Is PreSeedIQ?

PreSeedIQ is an educational startup valuation calculator. You answer 5 short steps about your company, and it returns a **LOW / BASE / HIGH** valuation range in USD, a confidence score, factor breakdowns, strengths/weaknesses, and an AI-powered recommendation.

> **Disclaimer:** Results are for educational purposes only. They do not constitute financial advice.

---

## Quick Start

1. Open `http://localhost:5173` in your browser.
2. Read and accept the disclaimer (checkbox required).
3. Fill in the 5-step wizard.
4. Click **CALCULATE VALUATION**.
5. Review your results on the Dashboard.

---

## Screen-by-Screen Guide

### 1. Landing Page

The first screen you see. It displays the **PreSeedIQ** brand title and a brief description. Click **Get Started** to proceed to the disclaimer.

---

### 2. Disclaimer Gate

Before accessing the form, you must check a box acknowledging that results are for **educational purposes only**. The **Continue** button stays disabled until you check it.

---

### 3. Step 1 — Basic Information

| Field | Type | Description | Example |
|---|---|---|---|
| **Company Name** | Text | Your startup's name | `Acme AI` |
| **Country** | Dropdown | Primary market / HQ country | `US` |
| **Industry** | Dropdown | Your sector | `SaaS` |
| **Business Model** | Dropdown | Who you sell to | `B2B` |
| **Startup Stage** | Dropdown | Current maturity | `MVP/Prototype Built` |

**Example entry:**
- Company Name: `Acme AI`
- Country: `US`
- Industry: `SaaS`
- Business Model: `B2B`
- Startup Stage: `MVP/Prototype Built`

---

### 4. Step 2 — Traction & Performance

| Field | Type | Description | Example |
|---|---|---|---|
| **Monthly Revenue (USD)** | Number | Recurring monthly revenue in dollars | `5000` |
| **Revenue Growth Rate (%)** | Number | Month-over-month or year-over-year revenue growth percentage | `15` |
| **Number of Users** | Number | Active paying users or customers | `200` |
| **Growth Type** | Dropdown | How the growth rate above is measured | `Month-over-Month` |
| **Growth Rate (%)** | Number | User/customer growth percentage | `20` |
| **Retention Rate (%)** | Number | Percentage of users retained (0–100) | `85` |

**Example entry (early-revenue startup):**
- Monthly Revenue: `5000`
- Revenue Growth Rate: `15`
- Number of Users: `200`
- Growth Type: `Month-over-Month`
- Growth Rate: `20`
- Retention Rate: `85`

**Example entry (pre-revenue startup):**
- Monthly Revenue: `0`
- Revenue Growth Rate: `0`
- Number of Users: `50`
- Growth Type: `Month-over-Month`
- Growth Rate: `30`
- Retention Rate: `60`

---

### 5. Step 3 — Market & Industry

| Field | Type | Description | Example |
|---|---|---|---|
| **Estimated Market Size (TAM)** | Number | Total addressable market in dollars | `1000000000` (1 billion) |
| **Industry Growth Rate** | Dropdown | How fast the industry is growing | `High` |
| **Competitive Intensity** | Dropdown | How crowded the market is | `Medium` |

**Example entry:**
- TAM: `1000000000`
- Industry Growth Rate: `High`
- Competitive Intensity: `Medium`

---

### 6. Step 4 — Team Profile

| Field | Type | Description | Example |
|---|---|---|---|
| **Number of Founders** | Spinner | How many co-founders (minimum 1) | `2` |
| **Founder Background** | Dropdown | Combined skill set of the founding team | `Mixed` |
| **Prior Exits or Relevant Experience** | Checkbox | Have any founders exited or have relevant industry experience? | `Checked` |

**Example entry (strong team):**
- Number of Founders: `3`
- Founder Background: `Mixed`
- Prior Exits: `Checked`

**Example entry (solo founder, no exits):**
- Number of Founders: `1`
- Founder Background: `Technical Only`
- Prior Exits: `Unchecked`

---

### 7. Step 5 — Financial & Risk

| Field | Type | Description | Example |
|---|---|---|---|
| **Burn Rate (USD per Month)** | Number | Monthly cash burn in dollars | `15000` |
| **Runway (Months)** | Number | How many months of cash remain | `8` |
| **Monetization Clarity** | Dropdown | How well-defined your revenue model is | `Clear/Validated` |
| **Regulatory or Execution Risk** | Dropdown | Level of regulatory or operational risk | `Low` |

**Example entry (healthy finances):**
- Burn Rate: `15000`
- Runway: `12`
- Monetization Clarity: `Clear/Validated`
- Regulatory Risk: `Low`

**Example entry (tight runway):**
- Burn Rate: `25000`
- Runway: `3`
- Monetization Clarity: `Hypothetical`
- Regulatory Risk: `High`

---

### 8. Dashboard (Results)

After clicking **CALCULATE VALUATION**, you land on the Dashboard. Here's what each section means:

#### Valuation Range (3 columns)

| Column | Meaning |
|---|---|
| **LOW** | Conservative floor valuation |
| **BASE** | Most likely valuation (highlighted in red) |
| **HIGH** | Optimistic ceiling valuation |

Below the columns you'll see a **Confidence** percentage (e.g., `Confidence: 80%`).

#### Factor Contribution (5 progress bars)

Each bar shows how a pillar scored (0–100%):

| Bar | What It Measures |
|---|---|
| **TRACTION** | Revenue, users, growth, retention |
| **MARKET** | TAM size, industry growth, competition |
| **TEAM** | Founder count, background, prior exits |
| **FINANCIAL** | Burn rate, runway, monetization clarity |
| **RISK** | Solo-founder penalty, runway risk |

#### Strengths & Weaknesses (2 columns)

- **Left (green):** What the engine identified as your startup's strengths.
- **Right (red):** Risk factors and weaknesses to address.

#### Recommendation

A 4-part strategy block covering:
1. **Fundraising Readiness** — Are you investor-ready?
2. **Valuation Expectations** — How to use the range in negotiations.
3. **Recommended Actions** — Concrete next steps for the next 6–12 months.
4. **Critical Concerns/Opportunities** — Key risks and how to address them.

If Ollama (local AI) is running, this section is generated dynamically. Otherwise, a fallback text is shown.

#### Action Bar (fixed bottom)

| Button | What It Does |
|---|---|
| **BACK TO FORM** | Returns to Step 5 so you can edit and recalculate |
| **EXPORT** | Opens the browser print dialog (prints as a clean A4 page) |
| **SHARE** | Copies the results URL to your clipboard |
| **NEW VALUATION** | Clears all data and starts a fresh evaluation |

---

## Complete Example Walkthrough

### Scenario: B2B SaaS Startup at MVP Stage

**Step 1:**
- Company Name: `CloudSync`
- Country: `US`
- Industry: `SaaS`
- Business Model: `B2B`
- Startup Stage: `MVP/Prototype Built`

**Step 2:**
- Monthly Revenue: `3000`
- Revenue Growth Rate: `12`
- Number of Users: `150`
- Growth Type: `Month-over-Month`
- Growth Rate: `18`
- Retention Rate: `78`

**Step 3:**
- TAM: `500000000`
- Industry Growth Rate: `High`
- Competitive Intensity: `Medium`

**Step 4:**
- Number of Founders: `2`
- Founder Background: `Mixed`
- Prior Exits: `Unchecked`

**Step 5:**
- Burn Rate: `10000`
- Runway: `10`
- Monetization Clarity: `Clear/Validated`
- Regulatory Risk: `Low`

**Expected result:** A BASE valuation around **$2.5M** with a confidence of ~75–80%, strengths in team composition and monetization clarity, and a weakness around runway length.

---

## Tips

- **All fields are required** — the Continue button stays disabled until every field on the current step is filled.
- **Your progress is saved automatically** — if you close the browser and return, your form data is still there (stored in `sessionStorage`).
- **Numeric fields only accept numbers** — letters and symbols are filtered out automatically.
- **Print-friendly** — the Export button produces a clean white-background A4 page with the action bar hidden.
