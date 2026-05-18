**Delayed REST Market Polling Pipeline**

- **Role**  
    Lead Backend / Workers Engineer.
- **Task**  
    Design and implement the rate-limited polling pipeline inside `DataWorker.run()` that acquires the `RateLimiter` token before each Yahoo Finance API call, and retries failed requests up to 3 times with linear backoff.
- **Context**  
    The Yahoo Finance API enforces rate limits; uncontrolled rapid calls cause HTTP 429 errors or IP bans. A `RateLimiter` (configured at 5 calls per 60 seconds via `config/settings.py`) serializes outbound requests. Each symbol fetch must `acquire()` before calling `yf.Ticker.history()`. On network or API failure, the worker retries with linear backoff (`1s, 2s, 3s`). After exhausting retries, an `error_occurred` signal is emitted. This pipeline is the sole path for REST data into the application.
- **Constraints**
    - **Rate Limit Config:** `API_RATE_LIMIT_CALLS=5` and `API_RATE_LIMIT_PERIOD_SEC=60` from `config/settings.py`. Do not hard-code values.
    - **Blocking Acquire:** `RateLimiter.acquire()` blocks the calling thread (the worker thread) until a slot is available. The UI thread is never blocked.
    - **Retry Budget:** Exactly 3 attempts per symbol. `time.sleep(1 * attempt)` between retries. Final failure emits `error_occurred`.
    - **Empty Data Handling:** `hist.empty` after a successful API call is treated as a failure and triggers the retry loop.
- **Format**  
    The pipeline is implemented inline in `DataWorker.run()`. No separate pipeline class. The `RateLimiter` is instantiated once in `__init__` and reused across all symbols in the `run()` call.
- **Acceptance Criteria**
    1. **Gauge Instantiation:** A `Gauge()` widget instantiates and displays a label — `set_value(0.8, "bullish")` sets `widget._label == "BULLISH"` (TestREQ202::test_gauge_instantiation).
    2. **Score Clamping:** Setting `score=5.0` clamps to `1.0`; `score=-5.0` clamps to `-1.0` via `max(-1.0, min(1.0, score))` (TestREQ202::test_gauge_clamps_score).
    3. **Rate Limiter Integration:** `RateLimiter.acquire()` is called before each `yf.Ticker(symbol).history(...)` inside `run()`.
    4. **Backoff Execution:** On failure, `time.sleep(1 * attempt)` is called for attempt 1, 2, 3 before retrying.

### Module API (`src/workers/rate_limiter.py`)

| Method | Signature | Returns | Notes |
|---|---|---|---|
| `RateLimiter.__init__()` | `(max_calls=5, period=60) -> None` | `None` | Defaults from `config.settings` |
| `RateLimiter.acquire()` | `() -> None` | `None` | Blocks until rate slot available; thread-safe via `Lock` + `deque` |

---

