import pyqtgraph as pg
from PyQt6.QtCore import Qt
from PyQt6.QtWidgets import QComboBox, QHBoxLayout, QVBoxLayout, QWidget

from config.settings import COLOR_BULLISH, COLOR_BEARISH, COLOR_NEUTRAL


class Chart(QWidget):
    INTERVALS = ["1m", "5m", "15m", "1h", "1d", "1wk"]
    PERIODS = ["5d", "1mo", "3mo", "6mo", "1y", "2y"]

    def __init__(self, parent=None) -> None:
        super().__init__(parent)
        self._period = "1mo"
        self._interval = "1d"

        self._canvas = pg.GraphicsLayoutWidget()
        self._canvas.setBackground("#0A192F")

        self._price_plot = self._canvas.addPlot(title="Price Chart")
        self._price_plot.showGrid(x=True, y=True, alpha=0.3)
        self._price_plot.setLabel("left", "Price")
        self._price_plot.setLabel("bottom", "Time")
        price_axis = self._price_plot.getAxis("left")
        price_axis.tickStrings = lambda values, scale, spacing: [f"{v:,.0f}" for v in values]

        self._canvas.nextRow()
        self._volume_plot = self._canvas.addPlot(title="Volume")
        self._volume_plot.showGrid(x=True, y=True, alpha=0.2)
        self._volume_plot.setLabel("left", "Volume")
        self._volume_plot.setMaximumHeight(120)
        self._volume_plot.setXLink(self._price_plot)
        vol_axis = self._volume_plot.getAxis("left")
        vol_axis.tickStrings = lambda values, scale, spacing: [f"{v:,.0f}" for v in values]

        self._crosshair_v = pg.InfiniteLine(angle=90, movable=False, pen=pg.mkPen("#CCD6F6", width=1, style=Qt.PenStyle.DashLine))
        self._crosshair_h = pg.InfiniteLine(angle=0, movable=False, pen=pg.mkPen("#CCD6F6", width=1, style=Qt.PenStyle.DashLine))
        self._price_plot.addItem(self._crosshair_v, ignoreBounds=True)
        self._price_plot.addItem(self._crosshair_h, ignoreBounds=True)
        self._crosshair_v.setVisible(False)
        self._crosshair_h.setVisible(False)

        self._proxy = pg.SignalProxy(
            self._price_plot.scene().sigMouseMoved, rateLimit=60, slot=self._mouse_moved
        )
        self._crosshair_label = pg.TextItem("", anchor=(1, 1))
        self._price_plot.addItem(self._crosshair_label)

        self._series: list[pg.PlotDataItem] = []

        self._build_toolbar()

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.addLayout(self._toolbar)
        layout.addWidget(self._canvas)

    def _build_toolbar(self) -> None:
        self._toolbar = QHBoxLayout()
        self._toolbar.addWidget(self._label("Interval:"))
        self._interval_combo = QComboBox()
        self._interval_combo.addItems(self.INTERVALS)
        self._interval_combo.setCurrentText(self._interval)
        self._toolbar.addWidget(self._interval_combo)
        self._toolbar.addWidget(self._label("Period:"))
        self._period_combo = QComboBox()
        self._period_combo.addItems(self.PERIODS)
        self._period_combo.setCurrentText(self._period)
        self._toolbar.addWidget(self._period_combo)
        self._toolbar.addStretch()

    @staticmethod
    def _label(text: str):
        from PyQt6.QtWidgets import QLabel
        lbl = QLabel(text)
        lbl.setStyleSheet("color: #CCD6F6;")
        return lbl

    def _mouse_moved(self, evt) -> None:
        pos = evt[0]
        if self._price_plot.sceneBoundingRect().contains(pos):
            mouse_point = self._price_plot.vb.mapSceneToView(pos)
            self._crosshair_v.setPos(mouse_point.x())
            self._crosshair_h.setPos(mouse_point.y())
            self._crosshair_v.setVisible(True)
            self._crosshair_h.setVisible(True)
            self._crosshair_label.setHtml(
                f'<span style="color:#CCD6F6; font-size:10px;">'
                f'x={mouse_point.x():.2f}  y={mouse_point.y():.2f}</span>'
            )
            self._crosshair_label.setPos(mouse_point)

    def current_interval(self) -> str:
        return self._interval_combo.currentText()

    def current_period(self) -> str:
        return self._period_combo.currentText()

    def plot_candles(self, times: list, opens: list, highs: list, lows: list, closes: list) -> None:
        self.clear_series()
        for t, o, h, l, c in zip(times, opens, highs, lows, closes):
            color = COLOR_BULLISH if c >= o else COLOR_BEARISH
            pen = pg.mkPen(color, width=1.5)
            item = pg.PlotDataItem([t, t], [l, h], pen=pen)
            self._price_plot.addItem(item)
            body = pg.PlotDataItem([t, t], [o, c], pen=pg.mkPen(color, width=4))
            self._price_plot.addItem(body)
            self._series.extend([item, body])

    def plot_volume_bars(self, times: list, volumes: list, closes: list) -> None:
        for t, v, c in zip(times, volumes, closes):
            color = COLOR_BULLISH if c >= 0 else COLOR_BEARISH
            bar = pg.BarGraphItem(x=t, height=v, width=0.6, brush=color, pen=pg.mkPen(None))
            self._volume_plot.addItem(bar)
            self._series.append(bar)

    def plot_line(self, times: list, values: list, color: str = COLOR_NEUTRAL, name: str = "") -> None:
        pen = pg.mkPen(color, width=1.5)
        item = self._price_plot.plot(times, values, pen=pen, name=name)
        self._series.append(item)
        self._price_plot.addItem(item)

    def clear_series(self) -> None:
        for item in self._series:
            for plot in [self._price_plot, self._volume_plot]:
                try:
                    plot.removeItem(item)
                except Exception:
                    pass
        self._series.clear()
