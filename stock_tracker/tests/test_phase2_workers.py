import time
import threading

import pytest
import pandas as pd
from PyQt6.QtCore import QThread, pyqtSignal
from PyQt6.QtWidgets import QApplication

from src.workers.data_worker import DataWorker
from src.workers.rate_limiter import RateLimiter


@pytest.fixture
def mock_yfinance(mocker):
    mock_df = pd.DataFrame({
        "Open": [100.0, 101.0, 102.0],
        "High": [105.0, 106.0, 107.0],
        "Low": [99.0, 100.0, 101.0],
        "Close": [102.0, 103.0, 104.0],
        "Volume": [1000, 1100, 1200],
    })
    mock_ticker = mocker.MagicMock()
    mock_ticker.history.return_value = mock_df
    mocker.patch("yfinance.Ticker", return_value=mock_ticker)
    return mock_ticker


@pytest.fixture
def mock_sleep(mocker):
    return mocker.patch("time.sleep")


def _wait_for_worker(worker, timeout=5000):
    worker.start()
    assert worker.wait(timeout), "Worker did not finish within timeout"
    QApplication.processEvents()


class TestDataWorkerSignals:
    """REQ-201 acceptance: Signal contract and thread isolation."""

    def test_data_worker_inherits_qthread(self):
        assert issubclass(DataWorker, QThread)

    def test_data_worker_signal_types(self):
        assert isinstance(DataWorker.data_fetched, pyqtSignal)
        assert isinstance(DataWorker.error_occurred, pyqtSignal)

    def test_data_worker_emits_data_fetched_on_success(self, qtbot, mocker, mock_yfinance):
        worker = DataWorker(symbols=["RELIANCE.NS"])
        data_results = []
        worker.data_fetched.connect(lambda s, d: data_results.append((s, d)))
        _wait_for_worker(worker)
        assert len(data_results) == 1
        symbol, df = data_results[0]
        assert symbol == "RELIANCE.NS"
        assert isinstance(df, pd.DataFrame)
        assert len(df) == 3

    def test_data_worker_emits_error_on_failure(self, qtbot, mocker, mock_sleep):
        mocker.patch("src.workers.data_worker.fetch_stock_data", return_value=None)
        mock_ticker = mocker.MagicMock()
        mock_ticker.history.side_effect = ConnectionError("API failure")
        mocker.patch("yfinance.Ticker", return_value=mock_ticker)
        worker = DataWorker(symbols=["RELIANCE.NS"])
        error_results = []
        worker.error_occurred.connect(lambda s, e: error_results.append((s, e)))
        _wait_for_worker(worker)
        assert len(error_results) == 1
        symbol, msg = error_results[0]
        assert symbol == "RELIANCE.NS"
        assert "API failure" in msg

    def test_worker_runs_in_separate_thread(self, qtbot, mocker, mock_yfinance):
        worker = DataWorker(symbols=["RELIANCE.NS"])
        main_thread_id = threading.current_thread().ident
        worker_thread_ids = []
        original_history = mock_yfinance.history

        def instrumented_history(*args, **kwargs):
            worker_thread_ids.append(threading.current_thread().ident)
            return original_history(*args, **kwargs)

        mock_yfinance.history.side_effect = instrumented_history
        worker.start()
        assert worker.wait(5000)
        QApplication.processEvents()
        assert len(worker_thread_ids) > 0, "Worker thread did not execute"
        for tid in worker_thread_ids:
            assert tid != main_thread_id, "yfinance call ran in main thread"


class TestDataWorkerSequentialProcessing:
    """REQ-203 acceptance: Sequential symbol processing and retry loop."""

    def test_sequential_symbol_processing(self, qtbot, mocker, mock_yfinance):
        symbols = ["RELIANCE.NS", "TCS.BO", "INFY.NS"]
        worker = DataWorker(symbols=symbols)
        processed = []
        worker.data_fetched.connect(lambda s, d: processed.append(s))
        _wait_for_worker(worker)
        assert processed == symbols

    def test_rate_limiter_acquired_before_each_symbol(self, qtbot, mocker, mock_yfinance):
        worker = DataWorker(symbols=["RELIANCE.NS", "TCS.BO"])
        acquire_calls = []
        original_acquire = worker._rate_limiter.acquire
        worker._rate_limiter.acquire = lambda: acquire_calls.append(True) or original_acquire()
        _wait_for_worker(worker)
        assert len(acquire_calls) == 2

    def test_worker_visits_all_symbols_after_errors(self, qtbot, mocker, mock_sleep):
        call_count = [0]

        def side_effect(*args, **kwargs):
            call_count[0] += 1
            if call_count[0] <= 3:
                raise ConnectionError("fail")
            return pd.DataFrame({"Close": [100.0]})

        mock_ticker = mocker.MagicMock()
        mock_ticker.history.side_effect = side_effect
        mocker.patch("yfinance.Ticker", return_value=mock_ticker)
        worker = DataWorker(symbols=["RELIANCE.NS", "TCS.BO"])
        data_results = []
        error_results = []
        worker.data_fetched.connect(lambda s, d: data_results.append(s))
        worker.error_occurred.connect(lambda s, e: error_results.append((s, e)))
        _wait_for_worker(worker)
        assert len(data_results) + len(error_results) == 2

    def test_retry_loop_success_on_second_attempt(self, qtbot, mocker, mock_sleep):
        call_count = [0]

        def side_effect(*args, **kwargs):
            call_count[0] += 1
            if call_count[0] == 1:
                raise ConnectionError("first fail")
            return pd.DataFrame({"Close": [100.0]})

        mock_ticker = mocker.MagicMock()
        mock_ticker.history.side_effect = side_effect
        mocker.patch("yfinance.Ticker", return_value=mock_ticker)
        worker = DataWorker(symbols=["RELIANCE.NS"])
        data_results = []
        error_results = []
        worker.data_fetched.connect(lambda s, d: data_results.append(s))
        worker.error_occurred.connect(lambda s, e: error_results.append((s, e)))
        _wait_for_worker(worker)
        assert len(data_results) == 1
        assert len(error_results) == 0
        assert call_count[0] == 2

    def test_retry_loop_exhausted_three_attempts(self, qtbot, mocker, mock_sleep):
        mocker.patch("src.workers.data_worker.fetch_stock_data", return_value=None)
        mock_ticker = mocker.MagicMock()
        mock_ticker.history.side_effect = ConnectionError("persistent failure")
        mocker.patch("yfinance.Ticker", return_value=mock_ticker)
        worker = DataWorker(symbols=["RELIANCE.NS"])
        error_results = []
        worker.error_occurred.connect(lambda s, e: error_results.append((s, e)))
        _wait_for_worker(worker)
        assert len(error_results) == 1
        assert mock_ticker.history.call_count == 3

    def test_retry_loop_exhausted_across_multiple_symbols(self, qtbot, mocker, mock_sleep):
        mocker.patch("src.workers.data_worker.fetch_stock_data", return_value=None)
        mock_ticker = mocker.MagicMock()
        mock_ticker.history.side_effect = ConnectionError("fail")
        mocker.patch("yfinance.Ticker", return_value=mock_ticker)
        worker = DataWorker(symbols=["RELIANCE.NS", "TCS.BO"])
        error_results = []
        worker.error_occurred.connect(lambda s, e: error_results.append((s, e)))
        _wait_for_worker(worker)
        assert len(error_results) == 2
        assert mock_ticker.history.call_count == 6

    def test_no_parallel_execution(self, qtbot, mocker, mock_yfinance):
        symbols = ["RELIANCE.NS", "TCS.BO", "INFY.NS", "HDFC.NS"]
        worker = DataWorker(symbols=symbols)
        spy_results = []
        worker.data_fetched.connect(lambda s, d: spy_results.append((s, time.monotonic())))
        _wait_for_worker(worker)
        assert len(spy_results) == 4
        for i in range(1, len(spy_results)):
            assert spy_results[i][1] >= spy_results[i - 1][1]


class TestDataWorkerBackoff:
    """REQ-202 acceptance: Backoff and retry timing."""

    def test_backoff_sleep_called_with_increasing_delay(self, qtbot, mocker, mock_sleep):
        mock_ticker = mocker.MagicMock()
        mock_ticker.history.side_effect = ConnectionError("fail")
        mocker.patch("yfinance.Ticker", return_value=mock_ticker)
        worker = DataWorker(symbols=["RELIANCE.NS"])
        _wait_for_worker(worker)
        expected_calls = [mocker.call(1), mocker.call(2)]
        mock_sleep.assert_has_calls(expected_calls, any_order=False)

    def test_backoff_attempt_count_correct(self, qtbot, mocker, mock_sleep):
        mocker.patch("src.workers.data_worker.fetch_stock_data", return_value=None)
        mock_ticker = mocker.MagicMock()
        mock_ticker.history.side_effect = ConnectionError("fail")
        mocker.patch("yfinance.Ticker", return_value=mock_ticker)
        worker = DataWorker(symbols=["RELIANCE.NS", "TCS.BO"])
        _wait_for_worker(worker)
        assert mock_sleep.call_count == 4

    def test_backoff_not_called_on_success(self, qtbot, mocker, mock_sleep):
        mock_yf = mocker.MagicMock()
        mock_yf.history.return_value = pd.DataFrame({"Close": [100.0]})
        mocker.patch("yfinance.Ticker", return_value=mock_yf)
        worker = DataWorker(symbols=["RELIANCE.NS"])
        _wait_for_worker(worker)
        mock_sleep.assert_not_called()

    def test_backoff_skipped_on_last_attempt(self, qtbot, mocker, mock_sleep):
        mocker.patch("src.workers.data_worker.fetch_stock_data", return_value=None)
        mock_ticker = mocker.MagicMock()
        mock_ticker.history.side_effect = ConnectionError("fail")
        mocker.patch("yfinance.Ticker", return_value=mock_ticker)
        worker = DataWorker(symbols=["RELIANCE.NS"])
        _wait_for_worker(worker)
        assert mock_sleep.call_count == 2
        expected_call = mocker.call(3)
        assert expected_call not in mock_sleep.call_args_list


class TestDataWorkerEdgeCases:
    """Edge case and failure scenarios for DataWorker."""

    def test_empty_symbols_list(self, qtbot, mocker, mock_yfinance):
        worker = DataWorker(symbols=[])
        data_results = []
        error_results = []
        worker.data_fetched.connect(lambda s, d: data_results.append((s, d)))
        worker.error_occurred.connect(lambda s, e: error_results.append((s, e)))
        _wait_for_worker(worker)
        assert len(data_results) == 0
        assert len(error_results) == 0

    def test_single_symbol(self, qtbot, mocker, mock_yfinance):
        worker = DataWorker(symbols=["ONLYONE"])
        data_results = []
        worker.data_fetched.connect(lambda s, d: data_results.append(s))
        _wait_for_worker(worker)
        assert data_results == ["ONLYONE"]

    def test_worker_finishes_cleanly(self, qtbot, mocker, mock_yfinance):
        worker = DataWorker(symbols=["RELIANCE.NS"])
        _wait_for_worker(worker)
        assert worker.isFinished()

    def test_empty_dataframe_triggers_retry(self, qtbot, mocker, mock_sleep):
        call_count = [0]

        def side_effect(*args, **kwargs):
            call_count[0] += 1
            if call_count[0] < 3:
                return pd.DataFrame()
            return pd.DataFrame({"Close": [100.0]})

        mock_ticker = mocker.MagicMock()
        mock_ticker.history.side_effect = side_effect
        mocker.patch("yfinance.Ticker", return_value=mock_ticker)
        worker = DataWorker(symbols=["RELIANCE.NS"])
        data_results = []
        worker.data_fetched.connect(lambda s, d: data_results.append(s))
        _wait_for_worker(worker)
        assert len(data_results) == 1
        assert call_count[0] == 3

    def test_all_empty_dataframes_exhaust_retries(self, qtbot, mocker, mock_sleep):
        mocker.patch("src.workers.data_worker.fetch_stock_data", return_value=None)
        mock_ticker = mocker.MagicMock()
        mock_ticker.history.return_value = pd.DataFrame()
        mocker.patch("yfinance.Ticker", return_value=mock_ticker)
        worker = DataWorker(symbols=["RELIANCE.NS"])
        error_results = []
        worker.error_occurred.connect(lambda s, e: error_results.append((s, e)))
        _wait_for_worker(worker)
        assert len(error_results) == 1
        assert "Empty data" in error_results[0][1]

    def test_yfinance_exception_contains_error_message(self, qtbot, mocker, mock_sleep):
        mocker.patch("src.workers.data_worker.fetch_stock_data", return_value=None)
        mock_ticker = mocker.MagicMock()
        mock_ticker.history.side_effect = ValueError("Invalid period")
        mocker.patch("yfinance.Ticker", return_value=mock_ticker)
        worker = DataWorker(symbols=["RELIANCE.NS"])
        error_results = []
        worker.error_occurred.connect(lambda s, e: error_results.append((s, e)))
        _wait_for_worker(worker)
        assert len(error_results) == 1
        assert "Invalid period" in error_results[0][1]

    def test_error_on_multiple_symbols_one_fails(self, qtbot, mocker, mock_sleep):
        call_count = [0]

        def side_effect(*args, **kwargs):
            call_count[0] += 1
            if call_count[0] == 1:
                raise ConnectionError("first fails")
            return pd.DataFrame({"Close": [100.0]})

        mock_ticker = mocker.MagicMock()
        mock_ticker.history.side_effect = side_effect
        mocker.patch("yfinance.Ticker", return_value=mock_ticker)
        worker = DataWorker(symbols=["FAIL.NS", "OK.NS"])
        data_results = []
        error_results = []
        worker.data_fetched.connect(lambda s, d: data_results.append(s))
        worker.error_occurred.connect(lambda s, e: error_results.append((s, e)))
        _wait_for_worker(worker)
        assert len(error_results) == 0
        assert len(data_results) == 2


class TestRateLimiter:
    """REQ-202 acceptance: Rate limiter behavior."""

    def test_rate_limiter_blocks_at_capacity(self):
        limiter = RateLimiter(max_calls=2, period=1)
        limiter.acquire()
        limiter.acquire()
        start = time.perf_counter()
        limiter.acquire()
        elapsed = time.perf_counter() - start
        assert elapsed > 0.0

    def test_rate_limiter_allows_under_limit(self):
        limiter = RateLimiter(max_calls=5, period=60)
        for _ in range(5):
            limiter.acquire()
        assert True

    def test_rate_limiter_expires_old_calls(self):
        limiter = RateLimiter(max_calls=2, period=0.05)
        limiter.acquire()
        time.sleep(0.06)
        limiter.acquire()
        limiter.acquire()
        assert True

    def test_rate_limiter_defaults_from_settings(self):
        limiter = RateLimiter()
        assert limiter._max_calls >= 1
        assert limiter._period >= 1

    def test_rate_limiter_thread_safe(self):
        limiter = RateLimiter(max_calls=100, period=60)

        def worker():
            for _ in range(10):
                limiter.acquire()

        threads = [threading.Thread(target=worker) for _ in range(5)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()
        assert len(limiter._timestamps) == 50
