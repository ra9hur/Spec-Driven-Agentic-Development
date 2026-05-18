**Multi-Threaded Worker Controller (QThread)**

- **Role**  
    Lead Backend / Workers Engineer.
- **Task**  
    Design and implement a `DataWorker` class that extends `QThread` to fetch historical stock data via the Yahoo Finance API in a background thread, emitting results through PyQt signals to avoid blocking the UI.
- **Context**  
    Phase 2 introduces background network workers so that the UI remains responsive during data fetch operations. `DataWorker` is the primary worker for retrieving OHLCV history for a list of symbols. It runs in its own thread via PyQt's `QThread` infrastructure and communicates results back to the main thread via `pyqtSignal`. The module lives at `src/workers/data_worker.py`.
- **Constraints**
    - **Technology Constraint:** Must extend `PyQt6.QtCore.QThread`. Network calls use the `yfinance` library exclusively. No `requests`, `httpx`, or `asyncio` wrappers.
    - **Thread Safety:** All UI updates must happen via signals — no direct widget mutation from within `run()`. The worker is single-shot per instance (call `start()` once, do not restart).
    - **Error Handling:** Up to 3 retry attempts per symbol with linear backoff (`1 * attempt` seconds). On final failure, emit `error_occurred`. Empty data frames are treated as failures.
- **Format**  
    The implementation is a single class in `src/workers/data_worker.py`. Constructor accepts `symbols`, `period`, and `interval`. The `run()` method iterates symbols, calls `RateLimiter.acquire()`, invokes `yf.Ticker(symbol).history(...)`, and emits either `data_fetched` or `error_occurred` signals.
- **Acceptance Criteria**
    1. **Chart Instantiation:** A `Chart()` widget can be created and added to a `qtbot` fixture; `widget.width() >= 0` confirms successful instantiation (TestREQ201::test_chart_instantiation).
    2. **Plot Line Rendering:** Calling `plot_line([1,2,3], [10,20,15], color="#F59E0B")` appends exactly one item to `widget._series` (TestREQ201::test_chart_plot_line).
    3. **Worker Thread Isolation:** `DataWorker` inherits from `QThread`; `run()` emits `data_fetched(symbol, DataFrame)` on success.
    4. **Signal Contract:** `data_fetched = pyqtSignal(str, object)` carries symbol string and pandas DataFrame; `error_occurred = pyqtSignal(str, str)` carries symbol and error message.

### Module API (`src/workers/data_worker.py`)

| Class / Method | Signature | Returns | Notes |
|---|---|---|---|
| `DataWorker.__init__()` | `(symbols: list[str], period="1mo", interval="1d") -> None` | `None` | Stores params; creates `RateLimiter` instance; sets `_retry_count = 3` |
| `DataWorker.run()` | `() -> None` | `None` | Iterates symbols; acquires rate limiter; retries up to 3× with `sleep(1*attempt)`; emits signals |
| `DataWorker.data_fetched` | `pyqtSignal(str, object)` | Signal | Emitted with `(symbol, hist_df)` on success |
| `DataWorker.error_occurred` | `pyqtSignal(str, str)` | Signal | Emitted with `(symbol, error_msg)` on final failure |
| `yf.Ticker.history()` | External call | `pd.DataFrame` | Called as `yf.Ticker(s).history(period=..., interval=...)` |

---

