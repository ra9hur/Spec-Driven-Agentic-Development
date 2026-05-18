**MACD Line, Signal, and Histogram Calculation**

- **Role**  
    Quantitative Developer / Financial Data Engineer.
- **Task**  
    Implement the full MACD oscillator returning three component series: MACD line, signal line, and histogram.
- **Context**  
    The Moving Average Convergence Divergence (MACD) is a trend-following momentum indicator composed of three series:
    - **MACD line** = `EMA(fast) - EMA(slow)` — computed via `ewm(span=fast).mean()` and `ewm(span=slow).mean()`.
    - **Signal line** = `EMA(span=signal)` of the MACD line — computed via `macd_line.ewm(span=signal).mean()`.
    - **Histogram** = `MACD line - Signal line`.
    Default parameters (fast=12, slow=26, signal=9) are configured in `config/settings.py` as `TECHNICAL_MACD_FAST`, `TECHNICAL_MACD_SLOW`, and `TECHNICAL_MACD_SIGNAL`. All three output series have the same length as the input.
- **Constraints**
    - **EMA Computation:** All exponential moving averages must use `pandas.DataFrame.ewm(span=N).mean()`. No manual recursion.
    - **Output Consistency:** The three returned `pd.Series` objects must have identical length to the input data and share its index.
    - **Parameter Override:** All three MACD parameters (fast, slow, signal) must be user-overridable integers.
- **Format**  
    A pure function in `src/engines/technical.py` returning a `tuple[pd.Series, pd.Series, pd.Series]` as `(macd_line, signal_line, histogram)`.
- **Acceptance Criteria** (mapped to `TestREQ301c` in `tests/test_phase3_intelligence.py`)
    1. `test_macd_output_shapes` — `len(macd) == len(signal) == len(hist) == 100`.
    2. `test_macd_components` — `not pd.isna(macd.iloc[-1])`.

### Module API (`src/engines/technical.py`)

| Function | Signature | Returns | Notes |
|---|---|---|---|
| `compute_macd` | `(data: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> tuple[pd.Series, pd.Series, pd.Series]` | `(macd_line, signal_line, histogram)` | All three series share the input length and index |

---

