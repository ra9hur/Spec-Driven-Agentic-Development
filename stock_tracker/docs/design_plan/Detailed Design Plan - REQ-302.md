**Corporate Regulatory Actions Text Extraction**

- **Role**  
    Financial Data Engineer / NLP Pipeline Developer.
- **Task**  
    Scan corporate announcement headlines and classify their directional trading impact using a keyword-based heuristic.
- **Context**  
    Regulatory filings from NSE and BSE are published as unstructured text headlines. The `scan_announcements` function iterates over a list of headlines and scores each via `_classify_impact`. The classifier uses regex word boundaries (`\b`) on case-lowered text. Each positive keyword match contributes +0.25 to the net score (capped at +1.0); each negative keyword contributes -0.25 (floored at -1.0). Positive keywords: `buyback`, `dividend`, `bonus`, `stock split`, `positive`, `upgrade`, `profit`, `growth`, `expansion`. Negative keywords: `downgrade`, `loss`, `fraud`, `investigation`, `penalty`, `default`, `layoff`, `restructuring`. Each result record includes the symbol, headline, impact score, and an ISO-8601 UTC scan timestamp.
- **Constraints**
    - **Keyword Matching:** Uses Python `re.findall` with `\b` word boundaries. Text is lowered via `.lower()` before matching.
    - **Impact Clamping:** Scores are clamped to the range `[-1.0, 1.0]`.
    - **No External Models:** The implementation is a pure regex heuristic. No ML or NLP API is used.
    - **Exchange Sources:** Constant `EXCHANGE_SOURCES = ["NSE", "BSE"]` is defined at module level for downstream use.
- **Format**  
    Two functions in `src/engines/corporate.py`. `scan_announcements` is the public entry point; `_classify_impact` is a module-private helper.
- **Acceptance Criteria** (mapped to `TestREQ302`/`TestREQ304b` in `tests/test_phase3_intelligence.py`)
    1. `test_scan_announcements_positive` — Positive keyword headline yields positive impact_score.
    2. `test_scan_announcements_negative` — Negative keyword headline yields negative impact_score.

### Module API (`src/engines/corporate.py`)

| Function | Signature | Returns | Notes |
|---|---|---|---|
| `scan_announcements` | `(symbol: str, headlines: list[str]) -> list[dict]` | `list[dict]` | Each dict: `symbol`, `headline`, `impact_score`, `scanned_at` (ISO-8601 UTC) |
| `_classify_impact` | `(headline: str) -> float` | `float` | `min(1.0, net_pos * 0.25)` / `max(-1.0, net_neg * 0.25)` / `0.0` |

---

