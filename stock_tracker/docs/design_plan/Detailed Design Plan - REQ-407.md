**Main-Thread Crash Resilience Under Worker Failure**

- **Role**  
    Lead Backend / Resilience Engineer.
- **Task**  
    Verify that the `RateLimiter` class can be instantiated without error on the main thread, serving as a basic smoke test that worker-dependency initialisation never crashes the UI thread.
- **Context**  
    When a background worker fails (e.g., network time-out, corrupt data), the main thread must remain responsive. The simplest smoke-test gate is confirming that the `RateLimiter` — the first dependency any worker touches — constructs successfully on the main thread. A failure here would indicate a broken import chain or missing settings dependency, crashing the application before any recovery logic can run.
- **Constraints**
    - **No Arguments:** `RateLimiter()` is called with no arguments, relying on default settings constants.
    - **Thread Context:** The test runs on the main test thread (no `qtbot` or QThread required).
    - **Assertion:** The resulting object must not be `None`.
- **Format**  
    Single test class `TestREQ407` in `tests/test_phase4_nfr_gates.py` with method `test_worker_retries_exhausted_without_crash`. Imports `RateLimiter` and asserts `limiter is not None` after default construction.
- **Acceptance Criteria**
    1. **RateLimiter Instantiates:** `RateLimiter()` called with no arguments returns a non-`None` object.
    2. **No Import Error:** No `ImportError` or `AttributeError` is raised when importing from `src.workers.rate_limiter`.
- **Module API** (`src/workers/rate_limiter.py`)

    | Class / Method | Signature | Returns | Notes |
    |---|---|---|---|
    | `RateLimiter.__init__` | `(max_calls: int = API_RATE_LIMIT_CALLS, period: int = API_RATE_LIMIT_PERIOD_SEC) -> None` | `None` | Defaults from `config.settings` constants |

---

