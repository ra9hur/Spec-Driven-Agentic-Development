**High-Volume Graphics Rendering Latency**

- **Role**  
    Lead Performance / NFR Engineer.
- **Task**  
    Verify that the MACD indicator computation completes in under 100 ms for 500 random data points, guaranteeing real-time chart rendering does not drop frames.
- **Context**  
    MACD is a heavier indicator than RSI because it chains two exponential moving-average calculations plus a signal-line EMA. To keep the full technical-analysis pipeline responsive, `compute_macd` with default parameters (fast=12, slow=26, signal=9) must finish within 100 ms on a 500-element dataset.
- **Constraints**
    - **Technology Constraint:** MACD must be computed via vectorized Pandas `ewm()` operations. No explicit Python loops.
    - **Performance Threshold:** 500 random normal values + offset of 100; wall-clock time via `time.perf_counter` must be under 100 ms.
    - **Default Parameters:** Only default `fast=12, slow=26, signal=9` are tested.
- **Format**  
    Single test class `TestREQ402` in `tests/test_phase4_nfr_gates.py` with method `test_macd_computes_under_100ms`. Generates `pd.Series(np.random.randn(500) + 100)`, calls `compute_macd(data)`, asserts elapsed `< 100`.
- **Acceptance Criteria**
    1. **MACD 500-Row Sub-100ms:** `compute_macd` on a 500-element Series completes in less than 100 ms.
    2. **No Exception:** The call does not raise any exception for well-formed numeric input.
- **Module API** (via `src/engines/technical.py`)

    | Function | Signature | Returns | Notes |
    |---|---|---|---|
    | `compute_macd` | `(data: pd.Series, fast=12, slow=26, signal=9) -> tuple[pd.Series, pd.Series, pd.Series]` | `(macd_line, signal_line, histogram)` | Vectorized via `data.ewm(span=...).mean()` chains |

---

