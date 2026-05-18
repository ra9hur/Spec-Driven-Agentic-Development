**Third-Party API Rate Limit Enforcement**

- **Role**  
    Lead Workers / Infrastructure Engineer.
- **Task**  
    Implement a sliding-window token-bucket rate limiter (`src/workers/rate_limiter.py`) that enforces a configurable maximum number of API calls within a fixed time window using a deque of timestamps and a threading lock.
- **Context**  
    External financial APIs (Yahoo Finance, Gemini) impose rate limits to prevent abuse. The `RateLimiter` class serialises access to these APIs via a sliding-window algorithm: each `acquire()` call prunes expired timestamps from the deque, blocks (via `time.sleep`) if the window is at capacity, and then appends the current timestamp. Defaults come from `config/settings.py`: `API_RATE_LIMIT_CALLS=5` and `API_RATE_LIMIT_PERIOD_SEC=60`.
- **Constraints**
    - **Thread Safety:** All mutations of the timestamp deque are protected by a `threading.Lock` used as a context manager.
    - **Sliding Window:** Expired timestamps older than `self._period` are `popleft()`-pruned before each decision.
    - **Blocking Behaviour:** When at capacity, the thread calls `time.sleep(sleep_for)` where `sleep_for = period - (now - timestamps[0])`, then pops the oldest timestamp and appends the new one.
    - **Defaults:** `RateLimiter()` with no arguments uses `max_calls=5, period=60`.
- **Format**  
    `RateLimiter` class in `src/workers/rate_limiter.py` with `__init__(self, max_calls, period)` and `acquire(self) -> None`. Tests live in `TestREQ405` in `tests/test_phase4_nfr_gates.py`.
- **Acceptance Criteria**
    1. **Blocks Excess Calls:** `RateLimiter(max_calls=2, period=1)` blocks on the 3rd call — elapsed time is strictly positive (TestREQ405::test_rate_limiter_blocks_excess_calls).
    2. **Allows Under-Limit Calls:** `RateLimiter(max_calls=5, period=60)` allows 3 rapid calls without blocking (TestREQ405::test_rate_limiter_allows_under_limit).
    3. **Default Construction:** `RateLimiter()` instantiates without error, reading defaults from settings.
- **Module API** (`src/workers/rate_limiter.py`)

    | Class / Method | Signature | Returns | Notes |
    |---|---|---|---|
    | `RateLimiter.__init__` | `(max_calls: int = 5, period: int = 60) -> None` | `None` | Stores limits; creates `deque()` and `threading.Lock()` |
    | `RateLimiter.acquire` | `() -> None` | `None` | Prunes expired timestamps; sleeps if at capacity; appends new timestamp; all under `self._lock` |

---

