**Application Cold-Start Latency Ceiling**

- **Role**  
    Lead Performance / NFR Engineer.
- **Task**  
    Verify that the consensus computation (`compute_consensus`) combining technical, corporate, and sentiment signals completes in under 100 ms, ensuring the cold-start analysis pipeline does not delay initial UI rendering.
- **Context**  
    On application cold-start, all three signal sources (RSI-based technical score, corporate-actions score, and sentiment score) are merged by `compute_consensus` into a single bullish/bearish/neutral recommendation. This gate ensures the combined computation runs within 100 ms so that the dashboard can populate without a perceptible pause.
- **Constraints**
    - **Technology Constraint:** `compute_consensus` must use vectorised Pandas operations only — no per-row Python iteration.
    - **Performance Threshold:** Input: a 100-element RSI Series plus two scalar scores (`corporate_score=0.2`, `sentiment_score=-0.1`). Elapsed time via `time.perf_counter` must be under 100 ms.
    - **Input Contract:** `technical` dict may contain `"rsi"` key mapping to a `pd.Series`; `corporate_score` and `sentiment_score` are floats on `[-1, 1]`.
- **Format**  
    Single test class `TestREQ406` in `tests/test_phase4_nfr_gates.py` with method `test_consensus_computes_under_100ms`. Generates `pd.Series(np.random.randn(100) + 100)`, creates a `technical` dict, calls `compute_consensus(...)`, asserts elapsed `< 100`.
- **Acceptance Criteria**
    1. **Consensus Sub-100ms:** `compute_consensus` with all three signal types completes in under 100 ms.
    2. **No Exception:** The call does not raise for any well-formed combination of inputs.
- **Module API** (via `src/engines/technical.py`)

    | Function | Signature | Returns | Notes |
    |---|---|---|---|
    | `compute_consensus` | `(technical: dict, corporate_score: float, sentiment_score: float) -> str` | `str` | Returns `"bullish"`, `"bearish"`, or `"neutral"` based on configurable thresholds |

---

