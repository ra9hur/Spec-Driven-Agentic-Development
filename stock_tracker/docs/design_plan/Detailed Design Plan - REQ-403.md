**Network Fault Tolerance & Graceful Degradation**

- **Role**  
    Lead Backend / Resilience Engineer.
- **Task**  
    Ensure `compute_rsi` gracefully handles constant-price data (zero variance) by returning either `NaN` or `50.0` instead of crashing with a division-by-zero or similar exception.
- **Context**  
    Real market data can stall during holidays or halts, producing flat series. The RSI calculation must degrade gracefully when there is no price movement. The test verifies that `compute_rsi` applied to 50 constant values of 100.0 returns a final value that is either exactly 50.0 (the neutral RSI level) or `NaN` (indicating the computation was undefined).
- **Constraints**
    - **Graceful Degradation:** The function must not raise `ZeroDivisionError`, `ValueError`, or any other exception.
    - **Return Contract:** The last element of the returned Series must be either `50.0` or `NaN` (checked with `pd.isna`).
    - **Input Shape:** Input is `pd.Series([100.0] * 50)` — 50 identical values.
- **Format**  
    Single test class `TestREQ403` in `tests/test_phase4_nfr_gates.py` with method `test_rsi_handles_constant_data`. Calls `compute_rsi(data)` and asserts `rsi.iloc[-1] == 50.0 or pd.isna(rsi.iloc[-1])`.
- **Acceptance Criteria**
    1. **Constant-Data No Crash:** `compute_rsi` on constant data does not raise any exception.
    2. **Degraded Output:** The final RSI value is either exactly `50.0` or `NaN`.
- **Module API** (via `src/engines/technical.py`)

    | Function | Signature | Returns | Notes |
    |---|---|---|---|
    | `compute_rsi` | `(data: pd.Series, window: int = 14) -> pd.Series` | `pd.Series` | Must handle zero-variance input by returning neutral or NaN |

---

