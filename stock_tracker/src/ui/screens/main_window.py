from PyQt6.QtCore import Qt
from PyQt6.QtWidgets import (
    QMainWindow, QSplitter, QVBoxLayout, QWidget,
    QPushButton, QScrollArea,
)

from src.ui.components.chart import Chart
from src.ui.components.gauge import Gauge
from src.ui.components.watchlist import Watchlist
from src.workers.data_worker import DataWorker
from config.database import list_watchlist_symbols


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("StockTracker Pro")
        self.resize(1280, 800)

        self.watchlist = Watchlist()
        self.chart = Chart()
        self.gauge = Gauge()

        self._current_symbol: str | None = None
        self._worker: DataWorker | None = None

        self._drawer_open = True
        self._drawer_toggle = QPushButton("▼ Insights")
        self._drawer_toggle.clicked.connect(self._toggle_drawer)

        self.watchlist.symbol_submitted.connect(self._on_symbol_submitted)
        self.watchlist.symbol_selected.connect(self._on_symbol_selected)

        self._build_layout()
        self._restore_watchlist()

    def _build_layout(self) -> None:
        splitter = QSplitter(Qt.Orientation.Horizontal)
        splitter.addWidget(self.watchlist)

        right_panel = QWidget()
        right_layout = QVBoxLayout(right_panel)
        right_layout.addWidget(self.chart)
        right_layout.addWidget(self._drawer_toggle)
        right_layout.addWidget(self.gauge)
        right_panel.setLayout(right_layout)
        splitter.addWidget(right_panel)

        splitter.setSizes([300, 980])
        self.setCentralWidget(splitter)

    def _toggle_drawer(self) -> None:
        self._drawer_open = not self._drawer_open
        self.gauge.setVisible(self._drawer_open)
        self._drawer_toggle.setText("▼ Insights" if self._drawer_open else "▲ Insights")

    def _restore_watchlist(self) -> None:
        rows = list_watchlist_symbols()
        if rows:
            display_rows = [
                {"symbol": r["symbol"]} for r in rows
            ]
            self.watchlist.populate(display_rows)

    def _on_symbol_submitted(self, symbol: str) -> None:
        rows = [{"symbol": r["symbol"]} for r in list_watchlist_symbols()]
        self.watchlist.populate(rows)
        self._fetch_symbol(symbol)

    def _on_symbol_selected(self, symbol: str) -> None:
        self._fetch_symbol(symbol)

    def _fetch_symbol(self, symbol: str) -> None:
        self._current_symbol = symbol
        self.statusBar().showMessage(f"Fetching {symbol}... please wait", 0)
        if self._worker is not None:
            for sig in ("data_fetched", "error_occurred", "fallback_active"):
                try:
                    sig_obj = getattr(self._worker, sig)
                    sig_obj.disconnect()
                except (TypeError, RuntimeError):
                    pass
            if self._worker.isRunning():
                self._worker.quit()
                self._worker.wait(2000)
        self._worker = DataWorker(symbols=[symbol])
        self._worker.data_fetched.connect(self._on_data_fetched)
        self._worker.error_occurred.connect(self._on_error_occurred)
        self._worker.fallback_active.connect(self._on_fallback_active)
        self._worker.start()

    def _on_data_fetched(self, symbol: str, hist) -> None:
        if hist is None or hist.empty:
            return
        times = (hist.index.astype("int64") * 1e-9).tolist()
        opens = hist["Open"].tolist()
        highs = hist["High"].tolist()
        lows = hist["Low"].tolist()
        closes = hist["Close"].tolist()
        volumes = hist["Volume"].tolist()
        if len(times) == 1 and opens[0] == closes[0]:
            from pyqtgraph import InfiniteLine, TextItem, mkPen
            self.chart.clear_series()
            t, p = times[0], closes[0]
            line = InfiniteLine(pos=p, angle=0, movable=False, pen=mkPen("#10B981", width=2, style=Qt.PenStyle.DashLine))
            self.chart._price_plot.addItem(line)
            label = TextItem(f"₹{p:,.2f}", anchor=(0.5, 0), color="#10B981")
            label.setPos(t, p)
            self.chart._price_plot.addItem(label)
            self.chart._series.extend([line, label])
        else:
            self.chart.plot_candles(times, opens, highs, lows, closes)
            self.chart.plot_volume_bars(times, volumes, closes)

    def _on_fallback_active(self, symbol: str) -> None:
        self.statusBar().showMessage(
            "Connection Alert: Yahoo Finance feed timed out. "
            "Seamlessly routed tracking loop through backup "
            "Google Finance pipeline (15-min delay applies).",
            10000,
        )

    def _on_error_occurred(self, symbol: str, error: str) -> None:
        self.statusBar().showMessage(f"Failed to load {symbol}: {error}", 10000)
