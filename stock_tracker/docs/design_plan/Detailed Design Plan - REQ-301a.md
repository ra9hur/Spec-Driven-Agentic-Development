**Simple Moving Average (SMA) Calculation**

- **Role**  
    Quantitative Developer / Financial Data Engineer.
- **Task**  
    Implement a vectorized Simple Moving Average function using pandas rolling window semantics.
- **Context**  
    SMA is the foundational trend-following indicator used across all downstream technical analysis. The implementation delegates to pandas' built-in `.rolling(window=window).mean()` which produces NaN for the first `window-1` periods and the moving average thereafter. Three standard windows (20, 50, 200) are configured via `TECHNICAL_SMA_WINDOWS` in `config/settings.py` and consumed by the bulk `compute_all()` helper.
- **Constraints**
    - **Vectorization Requirement:** Must use the vectorized pandas `rolling().mean()` pattern. No manual Python loops or iterative computation is permitted.
    - **Window Validity:** The function must accept any integer `window >= 1`. A window larger than the input length produces an all-NaN series.
    - **Index Preservation:** The returned `pd.Series` must preserve the index of the input data unchanged.
- **Format**  
    A pure function in `src/engines/technical.py`. Accepts `pd.Series` and integer `window`, returns `pd.Series`. No side effects, no IO.
- **Acceptance Criteria** (mapped to `TestREQ301a` in `tests/test_phase3_intelligence.py`)
    1. `test_sma_values` — `compute_sma(data, 3)` on `[1, 2, 3, 4, 5]` verifies NaN for first 2 values and `sma.iloc[2] == 2.0`.
    2. `test_sma_multiple_windows` — `compute_sma(data, 20)` / `compute_sma(data, 50)` / `compute_sma(data, 200)` each returns a series of length 100.

### Module API (`src/engines/technical.py`)

| Function | Signature | Returns | Notes |
|---|---|---|---|
| `compute_sma` | `(data: pd.Series, window: int) -> pd.Series` | `pd.Series` | `data.rolling(window=window).mean()`; NaN for first `window-1` entries |

---

