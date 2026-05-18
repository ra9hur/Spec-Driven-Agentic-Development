**Relative Strength Index (RSI-14) Calculation**

- **Role**  
    Quantitative Developer / Financial Data Engineer.
- **Task**  
    Implement the Relative Strength Index indicator using Wilder's smoothed Exponential Moving Average method.
- **Context**  
    RSI measures the magnitude of recent price changes to evaluate overbought or oversold conditions. The implementation uses Wilder's smoothing: `ewm(alpha=1/window, min_periods=window)` for both average gain and average loss. The RS ratio is `avg_gain / avg_loss`, with division-by-zero handled by replacing zero-loss entries with `np.nan`. The final RSI is `100 - 100 / (1 + RS)`. Default window is 14, matching `TECHNICAL_RSI_WINDOW` in `config/settings.py`. Output is bounded to the 0-100 range.
- **Constraints**
    - **Smoothing Method:** Must use `ewm(alpha=1/window, min_periods=window)` (Wilder's smoothed EMA), not a simple moving average or standard EMA.
    - **Zero Division Guard:** When `avg_loss` is zero (monotonic uptrend), the replacement with `np.nan` propagates to produce NaN in the RSI series.
    - **Default Window:** The `window` parameter defaults to 14 and must be overridable.
- **Format**  
    A pure function in `src/engines/technical.py`. Accepts `pd.Series` and optional integer window, returns `pd.Series` with values normalized to 0-100.
- **Acceptance Criteria** (mapped to `TestREQ301b` in `tests/test_phase3_intelligence.py`)
    1. `test_rsi_returns_series` — `len(rsi) == 100`, `rsi.min() >= 0`, `rsi.max() <= 100`.
    2. `test_rsi_constant_data` — `rsi.iloc[-1] == 50.0` or `pd.isna(rsi.iloc[-1])`.

### Module API (`src/engines/technical.py`)

| Function | Signature | Returns | Notes |
|---|---|---|---|
| `compute_rsi` | `(data: pd.Series, window: int = 14) -> pd.Series` | `pd.Series` | Wilder's smoothed EMA; values 0-100; NaN on zero-loss (constant uptrend) |

---

