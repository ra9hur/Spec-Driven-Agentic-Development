**Tri-Factor Signal Aggregation Engine**

- **Role**  
    Quantitative Developer / Signal Fusion Engineer.
- **Task**  
    Aggregate technical, corporate, and sentiment signals into a single consensus score and directional label.
- **Context**  
    The `compute_consensus` function accepts optional scores from three independent intelligence engines:
    - **Technical (RSI):** If `technical` dict is provided, the RSI value is extracted (`rsi.iloc[-1]` if Series; raw value otherwise). Oversold (`< 30`) contributes `+0.5`; overbought (`> 70`) contributes `-0.5`; otherwise `0.0`. NaN RSI values are silently skipped.
    - **Corporate:** A float in `[-1, 1]` representing regulatory action impact.
    - **Sentiment:** A float in `[-1, 1]` representing heuristic text polarity.
    The consensus is the arithmetic mean of all non-None inputs. Label is assigned using `CONSENSUS_BULLISH_THRESHOLD` (0.2) and `CONSENSUS_BEARISH_THRESHOLD` (-0.2) from `config/settings.py`. If no signals are provided, the result is `{"score": 0.0, "label": "NEUTRAL", "detail": "No signals available"}`.
- **Constraints**
    - **Equal Weighting:** All non-None scores are averaged equally. No per-signal weighting or prioritization is applied.
    - **RSI Scoring Rules:** `> 70` maps to `-0.5` (bearish momentum), `< 30` maps to `+0.5` (bullish momentum), `30..70` maps to `0.0`.
    - **NaN Handling:** RSI series with a NaN final value are silently excluded (no score appended).
    - **Rounding:** The final score is rounded to 4 decimal places.
- **Format**  
    A pure function in `src/engines/technical.py`. Accepts three optional keyword arguments; returns a dict with keys `score`, `label`, `detail`.
- **Acceptance Criteria** (mapped to `TestREQ304a` in `tests/test_phase3_intelligence.py`)
    1. `test_consensus_with_all_signals` — Result has `"score"` and `"label"` keys; label is in `("BULLISH", "BEARISH", "NEUTRAL")`.
    2. `test_consensus_no_signals` — `score == 0.0` and `label == "NEUTRAL"`.

### Module API (`src/engines/technical.py`)

| Function | Signature | Returns | Notes |
|---|---|---|---|
| `compute_consensus` | `(technical: dict \| None = None, corporate_score: float \| None = None, sentiment_score: float \| None = None) -> dict` | `{"score": float, "label": str, "detail": str}` | Averages all non-None scores; RSI scored ±0.5 / 0.0; threshold labels at ±0.2 |

---

