import logging
import time

import yfinance as yf
from PyQt6.QtCore import QThread, pyqtSignal

from src.workers.google_finance import fetch_stock_data
from src.workers.rate_limiter import RateLimiter

logging.getLogger("yfinance").setLevel(logging.CRITICAL)
logging.getLogger("yfinance").propagate = False


class DataWorker(QThread):
    data_fetched = pyqtSignal(str, object)
    error_occurred = pyqtSignal(str, str)
    fallback_active = pyqtSignal(str)

    def __init__(self, symbols: list[str], period: str = "1mo", interval: str = "1d") -> None:
        super().__init__()
        self.symbols = symbols
        self.period = period
        self.interval = interval
        self._rate_limiter = RateLimiter()
        self._retry_count = 3

    def run(self) -> None:
        for symbol in self.symbols:
            self._rate_limiter.acquire()
            success = False
            last_error = ""
            for attempt in range(1, self._retry_count + 1):
                if self.isInterruptionRequested():
                    return
                try:
                    ticker = yf.Ticker(symbol)
                    hist = ticker.history(period=self.period, interval=self.interval, auto_adjust=True)
                    if hist.empty:
                        raise ValueError("Empty data returned")
                    self.data_fetched.emit(symbol, hist)
                    success = True
                    break
                except Exception as e:
                    last_error = str(e)
                    if attempt < self._retry_count:
                        time.sleep(1 * attempt)
            if not success:
                if self.isInterruptionRequested():
                    return
                fallback = fetch_stock_data(symbol)
                if fallback is not None:
                    self.fallback_active.emit(symbol)
                    self.data_fetched.emit(symbol, fallback)
                else:
                    self.error_occurred.emit(symbol, last_error)
