**Deterministic Automated Refresh Loop**

- **Role**  
    Lead Backend / Workers Engineer.
- **Task**  
    Design and implement the sequential symbol-processing loop within `DataWorker.run()` that iterates the `symbols` list deterministically, rate-limiting each fetch through `RateLimiter.acquire()` and retrying up to 3 times on failure.
- **Context**  
    The refresh loop is the core deterministic scheduling mechanism of the data pipeline. Unlike event-driven or timer-based scheduling, this loop processes the symbol list sequentially in a single thread-local pass. Each iteration (per symbol) must acquire the rate limiter before calling the API. The loop guarantees ordering — symbols are processed in the same order as the input list. This determinism is critical for reproducible logging, debugging, and downstream signal ordering.
- **Constraints**
    - **Sequential Order:** `for symbol in self.symbols:` — no concurrency, no shuffling, no thread pool.
    - **Rate Limiting:** `RateLimiter.acquire()` is called at the top of each symbol iteration, before any retry loop.
    - **Retry on Failure:** Each symbol is attempted 3 times. Backoff uses `time.sleep(1 * attempt)`. After 3 failures, control moves to the next symbol.
    - **Completion Guarantee:** The loop runs to completion regardless of individual failures. All symbols are visited exactly once per `run()` invocation.
- **Format**  
    The loop is implemented directly in `DataWorker.run()`. No external scheduler or cron-like utility. The `RateLimiter` token bucket is configured at 5 calls per 60 seconds.
- **Acceptance Criteria**
    1. **Watchlist Instantiation:** A `Watchlist()` widget can be created and added to a `qtbot` fixture; `widget.isWidgetType()` returns `True` (TestREQ203::test_watchlist_instantiation).
    2. **Sequential Processing:** `DataWorker.run()` iterates `self.symbols` in list order; no parallel or out-of-order execution.
    3. **Rate-Limited Per-Symbol:** `RateLimiter.acquire()` is called once per symbol before the API call.
    4. **Retry Loop:** Each symbol is retried up to 3 times before either success or final error emission.

### Module API (`src/workers/data_worker.py`)

| Method | Signature | Returns | Notes |
|---|---|---|---|
| `DataWorker.run()` | `() -> None` | `None` | Sequential `for symbol in self.symbols`; rate-limited; retry loop inside |
| `RateLimiter.acquire()` | `() -> None` | `None` | Blocks until slot available; enforces 5 calls / 60s window |

---

