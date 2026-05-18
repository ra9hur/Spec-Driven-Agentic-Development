**UI Thread Responsiveness & Refresh Frame Rate**

- **Role**  
    Lead Performance / NFR Engineer.
- **Task**  
    Verify that the vectorized RSI computation completes in under 100 ms for 500 random data points, ensuring the UI thread is not blocked during indicator calculations.
- **Context**  
    Phase 4 enforces non-functional requirements (NFRs) that guard the application's performance. `compute_rsi` in `src/engines/technical.py` must use fully vectorized NumPy/Pandas operations so that even under a 500-element workload the computation finishes within 100 ms. This prevents UI stutter during real-time refresh cycles.
- **Constraints**
    - **Technology Constraint:** RSI computation must rely exclusively on vectorized Pandas operations (`pd.Series.diff`, `.rolling().mean()`). No explicit Python loops are permitted.
    - **Performance Threshold:** RSI on 500 random normal values + base offset of 100 must complete in under 100 ms wall-clock time (measured via `time.perf_counter`).
    - **Concurrency:** The test runs synchronously — no threading or async wrappers.
- **Format**  
    A single test class `TestREQ401` in `tests/test_phase4_nfr_gates.py` with method `test_rsi_computes_under_100ms`. It generates `pd.Series(np.random.randn(500) + 100)`, measures elapsed time for `compute_rsi(data)`, and asserts elapsed `< 100`.
- **Acceptance Criteria**
    1. **RSI 500-Row Sub-100ms:** `compute_rsi` on a 500-element Series completes in less than 100 ms.
    2. **No Exception:** The call does not raise any exception for well-formed numeric input.
- **Module API** (via `src/engines/technical.py`)

    | Function | Signature | Returns | Notes |
    |---|---|---|---|
    | `compute_rsi` | `(data: pd.Series, window: int = 14) -> pd.Series` | `pd.Series` | Fully vectorized; uses `ta.momentum.RSIIndicator` or equivalent rolling-window computation |

---

