import time
from collections import deque
from threading import Lock

from config.settings import API_RATE_LIMIT_CALLS, API_RATE_LIMIT_PERIOD_SEC


class RateLimiter:
    def __init__(self, max_calls: int = API_RATE_LIMIT_CALLS, period: int = API_RATE_LIMIT_PERIOD_SEC) -> None:
        self._max_calls = max_calls
        self._period = period
        self._timestamps: deque = deque()
        self._lock = Lock()

    def acquire(self) -> None:
        with self._lock:
            now = time.monotonic()
            while self._timestamps and now - self._timestamps[0] > self._period:
                self._timestamps.popleft()
            if len(self._timestamps) >= self._max_calls:
                if self._timestamps:
                    sleep_for = self._period - (now - self._timestamps[0])
                    if sleep_for > 0:
                        time.sleep(sleep_for)
                    self._timestamps.popleft()
                else:
                    time.sleep(self._period)
            self._timestamps.append(time.monotonic())
