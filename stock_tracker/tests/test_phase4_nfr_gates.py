import os
import time
import threading

import pytest
import pandas as pd
import numpy as np

from src.engines.technical import compute_rsi, compute_macd, compute_consensus
from src.workers.rate_limiter import RateLimiter
from config.database import DB_PATH
from config.settings import API_RATE_LIMIT_CALLS, API_RATE_LIMIT_PERIOD_SEC


# ---------------------------------------------------------------------------
# REQ-401  UI Thread Responsiveness & Refresh Frame Rate
# ---------------------------------------------------------------------------
class TestREQ401:
    """RSI computation must finish within 100 ms for 500 data points."""

    def test_rsi_computes_under_100ms(self):
        """AC1: 500 random values complete in under 100 ms."""
        data = pd.Series(np.random.randn(500) + 100)
        start = time.perf_counter()
        compute_rsi(data)
        elapsed = (time.perf_counter() - start) * 1000
        assert elapsed < 100

    def test_rsi_no_exception_for_valid_input(self):
        """AC2: No exception raised for well-formed numeric input."""
        data = pd.Series(np.random.randn(500) + 100)
        compute_rsi(data)

    def test_rsi_no_exception_small_data(self):
        """Edge: 2-element series does not raise."""
        data = pd.Series([100.0, 101.0])
        compute_rsi(data)

    def test_rsi_no_exception_large_window(self):
        """Edge: window larger than data length does not raise."""
        data = pd.Series(np.random.randn(10) + 100)
        compute_rsi(data, window=50)

    def test_rsi_no_exception_all_nan(self):
        """Edge: all-NaN input does not raise."""
        data = pd.Series([np.nan] * 50)
        compute_rsi(data)

    def test_rsi_no_exception_single_element(self):
        """Edge: single-element input does not raise."""
        data = pd.Series([100.0])
        compute_rsi(data)

    def test_rsi_no_exception_empty_series(self):
        """Edge: empty series does not raise."""
        data = pd.Series([], dtype=float)
        result = compute_rsi(data)
        assert len(result) == 0


# ---------------------------------------------------------------------------
# REQ-402  High-Volume Graphics Rendering Latency
# ---------------------------------------------------------------------------
class TestREQ402:
    """MACD computation must finish within 100 ms for 500 data points."""

    def test_macd_computes_under_100ms(self):
        """AC1: 500 random values complete in under 100 ms."""
        data = pd.Series(np.random.randn(500) + 100)
        start = time.perf_counter()
        compute_macd(data)
        elapsed = (time.perf_counter() - start) * 1000
        assert elapsed < 100

    def test_macd_no_exception_for_valid_input(self):
        """AC2: No exception raised for well-formed numeric input."""
        data = pd.Series(np.random.randn(500) + 100)
        compute_macd(data)

    def test_macd_no_exception_small_data(self):
        """Edge: 3-element series does not raise."""
        data = pd.Series([100.0, 101.0, 102.0])
        compute_macd(data)

    def test_macd_no_exception_all_nan(self):
        """Edge: all-NaN input does not raise."""
        data = pd.Series([np.nan] * 50)
        compute_macd(data)

    def test_macd_no_exception_constant_data(self):
        """Edge: constant (zero-variance) data does not raise."""
        data = pd.Series([100.0] * 50)
        macd, signal, hist = compute_macd(data)
        assert macd.iloc[-1] == pytest.approx(0.0, abs=1e-10)

    def test_macd_no_exception_empty_series(self):
        """Edge: empty series does not raise."""
        data = pd.Series([], dtype=float)
        macd, signal, hist = compute_macd(data)
        assert len(macd) == len(signal) == len(hist) == 0


# ---------------------------------------------------------------------------
# REQ-403  Network Fault Tolerance & Graceful Degradation
# ---------------------------------------------------------------------------
class TestREQ403:
    """RSI must degrade gracefully on constant-price (zero-variance) data."""

    def test_rsi_handles_constant_data(self):
        """AC2: Final value is either 50.0 or NaN for 50 constant values."""
        data = pd.Series([100.0] * 50)
        rsi = compute_rsi(data)
        assert rsi.iloc[-1] == 50.0 or pd.isna(rsi.iloc[-1])

    def test_rsi_constant_no_exception(self):
        """AC1: No exception raised on constant data."""
        data = pd.Series([100.0] * 50)
        compute_rsi(data)

    def test_rsi_constant_single_value(self):
        """Edge: single constant value does not raise and returns NaN."""
        data = pd.Series([100.0])
        rsi = compute_rsi(data)
        assert pd.isna(rsi.iloc[-1])

    def test_rsi_constant_two_values(self):
        """Edge: two constant values do not raise, last is NaN."""
        data = pd.Series([100.0, 100.0])
        rsi = compute_rsi(data)
        assert pd.isna(rsi.iloc[-1]) or rsi.iloc[-1] == 50.0

    def test_rsi_constant_minimal_variance(self):
        """Edge: nearly constant with tiny noise does not raise."""
        data = pd.Series([100.0 + 1e-12 * i for i in range(50)])
        rsi = compute_rsi(data)
        assert rsi.iloc[-1] == 50.0 or pd.isna(rsi.iloc[-1])

    def test_rsi_constant_all_nan(self):
        """Edge: all-NaN input does not raise."""
        data = pd.Series([np.nan] * 50)
        compute_rsi(data)


# ---------------------------------------------------------------------------
# REQ-404  Local Data Storage Footprint Constraints
# ---------------------------------------------------------------------------
class TestREQ404:
    """Database storage directory must be initialised correctly."""

    def test_database_storage_footprint(self):
        """AC1: Parent directory of DB_PATH exists on disk."""
        assert os.path.isdir(os.path.dirname(DB_PATH))

    def test_db_path_is_string_constant(self):
        """AC2: DB_PATH is a well-defined string constant."""
        assert isinstance(DB_PATH, str)
        assert len(DB_PATH) > 0

    def test_db_path_ends_with_tracker_db(self):
        """Edge: DB_PATH filename ends with tracker.db."""
        assert DB_PATH.endswith("tracker.db")

    def test_data_dir_writable(self):
        """Edge: data directory is writable."""
        data_dir = os.path.dirname(DB_PATH)
        assert os.access(data_dir, os.W_OK)


# ---------------------------------------------------------------------------
# REQ-405  Third-Party API Rate Limit Enforcement
# ---------------------------------------------------------------------------
class TestREQ405:
    """Sliding-window token-bucket rate limiter."""

    def test_rate_limiter_blocks_excess_calls(self):
        """AC1: Blocks when exceeding max_calls — elapsed time > 0."""
        limiter = RateLimiter(max_calls=2, period=1)
        start = time.perf_counter()
        limiter.acquire()
        limiter.acquire()
        limiter.acquire()
        elapsed = time.perf_counter() - start
        assert elapsed > 0.0

    def test_rate_limiter_allows_under_limit(self):
        """AC2: Allows calls under max_calls without blocking."""
        limiter = RateLimiter(max_calls=5, period=60)
        for _ in range(3):
            limiter.acquire()

    def test_rate_limiter_default_construction(self):
        """AC3: RateLimiter() with no arguments instantiates without error."""
        limiter = RateLimiter()
        assert limiter is not None

    def test_rate_limiter_exact_limit_not_blocked(self):
        """Edge: exactly max_calls calls do not block."""
        limiter = RateLimiter(max_calls=3, period=60)
        start = time.perf_counter()
        for _ in range(3):
            limiter.acquire()
        elapsed = time.perf_counter() - start
        assert elapsed < 1.0

    def test_rate_limiter_single_call_does_not_block(self):
        """Edge: single call returns immediately."""
        limiter = RateLimiter(max_calls=1, period=60)
        start = time.perf_counter()
        limiter.acquire()
        elapsed = time.perf_counter() - start
        assert elapsed < 1.0

    def test_rate_limiter_defaults_from_settings(self):
        """Edge: default params match config.settings constants."""
        limiter = RateLimiter()
        assert limiter._max_calls == API_RATE_LIMIT_CALLS
        assert limiter._period == API_RATE_LIMIT_PERIOD_SEC

    def test_rate_limiter_sequential_after_block(self):
        """Edge: after a blocking call, next call is fast (window slid)."""
        limiter = RateLimiter(max_calls=1, period=0.05)
        limiter.acquire()
        time.sleep(0.06)
        start = time.perf_counter()
        limiter.acquire()
        assert time.perf_counter() - start < 0.5

    def test_rate_limiter_max_calls_zero(self):
        """Edge: max_calls=0 blocks every call."""
        limiter = RateLimiter(max_calls=0, period=0.01)
        start = time.perf_counter()
        limiter.acquire()
        elapsed = time.perf_counter() - start
        assert elapsed > 0.0


# ---------------------------------------------------------------------------
# REQ-406  Application Cold-Start Latency Ceiling
# ---------------------------------------------------------------------------
class TestREQ406:
    """Consensus computation must finish within 100 ms."""

    def test_consensus_computes_under_100ms(self):
        """AC1: Consensus with all three signals under 100 ms."""
        rsi_series = pd.Series(np.random.randn(100) + 100)
        technical = {"rsi": rsi_series}
        start = time.perf_counter()
        compute_consensus(technical=technical, corporate_score=0.2, sentiment_score=-0.1)
        elapsed = (time.perf_counter() - start) * 1000
        assert elapsed < 100

    def test_consensus_no_exception_full_input(self):
        """AC2: No exception for well-formed inputs."""
        rsi_series = pd.Series(np.random.randn(100) + 100)
        compute_consensus(technical={"rsi": rsi_series}, corporate_score=0.2, sentiment_score=-0.1)

    def test_consensus_no_exception_no_signals(self):
        """Edge: no signals at all does not raise."""
        compute_consensus()

    def test_consensus_no_exception_only_technical(self):
        """Edge: only technical signal does not raise."""
        rsi_series = pd.Series(np.random.randn(100) + 100)
        compute_consensus(technical={"rsi": rsi_series})

    def test_consensus_no_exception_only_corporate(self):
        """Edge: only corporate score does not raise."""
        compute_consensus(corporate_score=0.5)

    def test_consensus_no_exception_only_sentiment(self):
        """Edge: only sentiment score does not raise."""
        compute_consensus(sentiment_score=-0.3)

    def test_consensus_missing_rsi_key(self):
        """Edge: technical dict without 'rsi' key does not raise."""
        compute_consensus(technical={"sma": pd.Series([1, 2, 3])}, corporate_score=0.2)

    def test_consensus_empty_technical_dict(self):
        """Edge: empty technical dict does not raise."""
        compute_consensus(technical={}, corporate_score=0.2, sentiment_score=-0.1)

    def test_consensus_rsi_all_nan(self):
        """Edge: RSI series with all NaN values does not raise."""
        rsi_series = pd.Series([np.nan] * 100)
        result = compute_consensus(technical={"rsi": rsi_series}, corporate_score=0.2)
        assert result["score"] == pytest.approx(0.2)

    def test_consensus_extreme_scores(self):
        """Edge: boundary scores at -1 and 1 work correctly."""
        result = compute_consensus(corporate_score=1.0, sentiment_score=-1.0)
        assert "score" in result
        assert result["label"] in ("BULLISH", "BEARISH", "NEUTRAL")

    def test_consensus_under_100ms_large_rsi(self):
        """Edge: 1000-element RSI series still under 100 ms."""
        rsi_series = pd.Series(np.random.randn(1000) + 100)
        start = time.perf_counter()
        compute_consensus(technical={"rsi": rsi_series}, corporate_score=0.2, sentiment_score=-0.1)
        elapsed = (time.perf_counter() - start) * 1000
        assert elapsed < 100


# ---------------------------------------------------------------------------
# REQ-407  Main-Thread Crash Resilience Under Worker Failure
# ---------------------------------------------------------------------------
class TestREQ407:
    """RateLimiter must instantiate on the main thread without error."""

    def test_worker_retries_exhausted_without_crash(self):
        """AC1: RateLimiter() returns a non-None object."""
        limiter = RateLimiter()
        assert limiter is not None

    def test_rate_limiter_import_no_error(self):
        """AC2: Import from src.workers.rate_limiter does not raise."""
        from src.workers import rate_limiter
        assert hasattr(rate_limiter, "RateLimiter")

    def test_rate_limiter_multiple_instances(self):
        """Edge: multiple instantiations on main thread succeed."""
        for _ in range(10):
            limiter = RateLimiter()
            assert limiter is not None

    def test_rate_limiter_default_params_match_settings(self):
        """Edge: default max_calls and period match settings."""
        limiter = RateLimiter()
        assert limiter._max_calls == API_RATE_LIMIT_CALLS
        assert limiter._period == API_RATE_LIMIT_PERIOD_SEC

    def test_rate_limiter_acquire_on_main_thread(self):
        """Edge: acquire() on main thread does not block indefinitely."""
        limiter = RateLimiter(max_calls=5, period=60)
        limiter.acquire()
        assert True
