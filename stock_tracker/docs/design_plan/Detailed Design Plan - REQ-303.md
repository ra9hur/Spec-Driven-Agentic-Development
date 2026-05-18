**Zero-Cost AI Sentiment Pipeline**

- **Role**  
    NLP Pipeline Developer / Sentiment Analyst.
- **Task**  
    Implement a zero-cost heuristic sentiment analyzer for financial text with no external API dependencies.
- **Context**  
    The sentiment pipeline analyzes financial headlines or news snippets using a purely heuristic keyword-counting approach. The `analyze_sentiment` function computes polarity as `(pos - neg) / total` where `total` is the sum of positive and negative keyword matches (if total is 0, polarity defaults to 0.0). Positive keywords: `bullish`, `upward`, `rally`, `outperform`, `beat`, `growth`, `strong`, `positive`. Negative keywords: `bearish`, `downward`, `crash`, `underperform`, `miss`, `decline`, `weak`, `negative`. Labels are assigned at thresholds: `> 0.2` = `bullish`, `< -0.2` = `bearish`, else `neutral`. The module reads `GEMINI_API_KEY` from the environment at import time, but the Gemini model integration is not wired in the current implementation — the `source` field is always `"heuristic"`.
- **Constraints**
    - **No External API Calls:** Sentiment computation is entirely local. No HTTP requests or third-party NLP services are invoked.
    - **Fixed Label Thresholds:** The bullish/bearish boundaries are hardcoded at ±0.2 and are not configurable.
    - **Gemini Stub:** `GEMINI_API_KEY` is read and stored as a module-level constant but is unused in the heuristic path; the return dict always contains `"source": "heuristic"`.
    - **Pure Regex:** Keyword matching uses `re.findall` with `\b` word boundaries on lowered text.
- **Format**  
    Three functions in `src/engines/sentiment.py`. `analyze_sentiment` is the public API; `_heuristic_polarity` and `_to_label` are module-private helpers.
- **Acceptance Criteria** (mapped to `TestREQ303` in `tests/test_phase3_intelligence.py`)
    1. `test_sentiment_bullish` — Label is `"bullish"`.
    2. `test_sentiment_bearish` — Label is `"bearish"`.
    3. `test_sentiment_neutral` — Label is `"neutral"`.

### Module API (`src/engines/sentiment.py`)

| Function | Signature | Returns | Notes |
|---|---|---|---|
| `analyze_sentiment` | `(text: str) -> dict` | `{"score": float, "label": str, "source": str}` | `source` is always `"heuristic"`; Gemini not wired |
| `_heuristic_polarity` | `(text: str) -> float` | `float` | `(pos - neg) / total`; `0.0` when no keywords match |
| `_to_label` | `(score: float) -> str` | `"bullish" \| "bearish" \| "neutral"` | Thresholds: `> 0.2`, `< -0.2` |

---

