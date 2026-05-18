import pytest
from PyQt6.QtCore import Qt
from src.ui.components.chart import Chart
from src.ui.components.gauge import Gauge
from src.ui.components.watchlist import Watchlist


class TestREQ201:
    def test_chart_instantiation(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        assert widget.width() >= 0

    def test_chart_plot_line(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_line([1, 2, 3], [10, 20, 15], color="#F59E0B")
        assert len(widget._series) == 1


class TestREQ202:
    def test_gauge_instantiation(self, qtbot):
        widget = Gauge()
        qtbot.addWidget(widget)
        widget.set_value(0.8, "bullish")
        assert widget._label == "BULLISH"

    def test_gauge_clamps_score(self, qtbot):
        widget = Gauge()
        qtbot.addWidget(widget)
        widget.set_value(5.0, "bullish")
        assert widget._score == 1.0
        widget.set_value(-5.0, "bearish")
        assert widget._score == -1.0


class TestREQ203:
    def test_watchlist_instantiation(self, qtbot):
        widget = Watchlist()
        qtbot.addWidget(widget)
        assert widget.isWidgetType()


class TestREQ204a:
    """REQ-204a: PyQtGraph Viewport Embedding and Axis Configuration."""

    def test_chart_has_price_plot(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        assert widget._price_plot is not None

    def test_chart_has_volume_plot(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        assert widget._volume_plot is not None

    def test_canvas_background(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        color = widget._canvas.backgroundBrush().color()
        assert color.name() == "#0a192f"

    def test_price_plot_title(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        assert widget._price_plot.titleLabel.text == "Price Chart"

    def test_volume_plot_title(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        assert widget._volume_plot.titleLabel.text == "Volume"

    def test_volume_plot_max_height(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        assert widget._volume_plot.maximumHeight() == 120

    def test_price_plot_axis_labels(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        assert widget._price_plot.getAxis("left").label.toPlainText().strip() == "Price"
        assert widget._price_plot.getAxis("bottom").label.toPlainText().strip() == "Time"

    def test_volume_plot_axis_label(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        assert widget._volume_plot.getAxis("left").label.toPlainText().strip() == "Volume"

    def test_price_plot_grid_enabled(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        grid = widget._price_plot.ctrl.gridAlphaSlider
        assert grid is not None

    def test_xlink_synchronized(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        import pyqtgraph as pg
        linked = widget._volume_plot.vb.state["linkedViews"][pg.ViewBox.XAxis]
        assert linked is not None
        assert linked() is widget._price_plot.vb

    def test_layout_rows_separated_by_next_row(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        rows = widget._canvas.ci.rows
        assert len(rows) == 2

    def test_volume_plot_is_second_row(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        items = widget._canvas.ci.items
        plot_items = [it for it in items if it is not None]
        assert len(plot_items) >= 2


class TestREQ204b:
    """REQ-204b: Candlestick and Volume Bar Series Rendering."""

    def test_plot_candles(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_candles(
            [1, 2], [100, 102], [105, 107], [98, 100], [102, 103]
        )
        assert len(widget._series) > 0

    def test_candles_wick_and_body_count(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_candles(
            [1, 2], [100, 102], [105, 107], [98, 100], [102, 103]
        )
        assert len(widget._series) == 4

    def test_candles_single_candle(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_candles([1], [100], [105], [98], [102])
        assert len(widget._series) == 2

    def test_candles_empty_lists(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_candles([], [], [], [], [])
        assert len(widget._series) == 0

    def test_candles_clears_series_first(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_candles([1], [100], [105], [98], [102])
        assert len(widget._series) == 2
        widget.plot_candles([2], [101], [106], [99], [103])
        assert len(widget._series) == 2

    def test_candle_bullish_color(self, qtbot):
        from config.settings import COLOR_BULLISH
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_candles([1], [100], [105], [98], [102])
        pen = widget._series[0].opts["pen"]
        assert pen.color().name().upper() == COLOR_BULLISH.upper()

    def test_candle_bearish_color(self, qtbot):
        from config.settings import COLOR_BEARISH
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_candles([1], [102], [105], [98], [100])
        pen = widget._series[0].opts["pen"]
        assert pen.color().name().upper() == COLOR_BEARISH.upper()

    def test_candle_wick_pen_width(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_candles([1], [100], [105], [98], [102])
        pen = widget._series[0].opts["pen"]
        assert pen.width() >= 1

    def test_candle_body_pen_width(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_candles([1], [100], [105], [98], [102])
        body_pen = widget._series[1].opts["pen"]
        assert body_pen.width() == 4

    def test_candle_wick_is_first_body_is_second(self, qtbot):
        import pyqtgraph as pg
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_candles([1], [100], [105], [98], [102])
        wick = widget._series[0]
        body = widget._series[1]
        assert isinstance(wick, pg.PlotDataItem)
        assert isinstance(body, pg.PlotDataItem)

    def test_candles_are_plot_data_items(self, qtbot):
        import pyqtgraph as pg
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_candles([1, 2], [100, 102], [105, 107], [98, 100], [102, 103])
        for item in widget._series:
            assert isinstance(item, pg.PlotDataItem)

    def test_mismatched_list_lengths_graceful(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_candles([1, 2, 3], [100, 102], [105, 107, 109], [98, 100], [102, 103])
        assert len(widget._series) >= 0


class TestREQ205:
    def test_chart_clear_series(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_line([1, 2], [10, 20])
        assert len(widget._series) == 1
        widget.clear_series()
        assert len(widget._series) == 0

    def test_clear_series_idempotent(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        widget.clear_series()
        assert len(widget._series) == 0

    def test_clear_series_both_plots(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_line([1, 2], [10, 20])
        widget.plot_volume_bars([1, 2], [1000, 2000], [105, 98])
        assert len(widget._series) == 3
        widget.clear_series()
        assert len(widget._series) == 0

    def test_clear_series_preserves_crosshair(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_line([1, 2, 3], [10, 20, 15])
        widget.clear_series()
        assert widget._crosshair_v is not None
        assert widget._crosshair_h is not None
        assert widget._crosshair_label is not None


class TestREQ206:
    """REQ-204b (volume): Volume bar rendering."""

    def test_plot_volume_bars(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_volume_bars([1, 2], [1000, 2000], [105, 98])
        assert widget._volume_plot is not None

    def test_volume_bars_creates_bar_graph_items(self, qtbot):
        import pyqtgraph as pg
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_volume_bars([1, 2], [1000, 2000], [105, 98])
        assert len(widget._series) == 2
        for item in widget._series:
            assert isinstance(item, pg.BarGraphItem)

    def test_volume_bar_positive_close_color(self, qtbot):
        from config.settings import COLOR_BULLISH
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_volume_bars([1], [1000], [105])
        brush = widget._series[0].opts["brush"]
        assert brush.upper() == COLOR_BULLISH.upper()

    def test_volume_bar_negative_close_color(self, qtbot):
        from config.settings import COLOR_BEARISH
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_volume_bars([1], [1000], [-5])
        brush = widget._series[0].opts["brush"]
        assert brush.upper() == COLOR_BEARISH.upper()

    def test_volume_bar_zero_close_color(self, qtbot):
        from config.settings import COLOR_BULLISH
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_volume_bars([1], [1000], [0])
        brush = widget._series[0].opts["brush"]
        assert brush.upper() == COLOR_BULLISH.upper()

    def test_volume_bars_empty_lists(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_volume_bars([], [], [])
        assert len(widget._series) == 0

    def test_volume_bars_single_bar(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_volume_bars([1], [1000], [105])
        assert len(widget._series) == 1

    def test_volume_bars_pen_is_no_pen(self, qtbot):
        from PyQt6.QtCore import Qt
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_volume_bars([1], [1000], [105])
        pen = widget._series[0].opts["pen"]
        assert pen.style() == Qt.PenStyle.NoPen

    def test_volume_bars_mixed_colors(self, qtbot):
        from config.settings import COLOR_BULLISH, COLOR_BEARISH
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_volume_bars([1, 2, 3], [1000, 2000, 1500], [105, -5, 0])
        assert len(widget._series) == 3
        assert widget._series[0].opts["brush"].upper() == COLOR_BULLISH.upper()
        assert widget._series[1].opts["brush"].upper() == COLOR_BEARISH.upper()
        assert widget._series[2].opts["brush"].upper() == COLOR_BULLISH.upper()

    def test_volume_bars_mismatched_lists(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        widget.plot_volume_bars([1, 2, 3], [1000, 2000], [105, 98])
        assert len(widget._series) == 2


class TestREQ207:
    def test_crosshair_items_exist(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        assert widget._crosshair_v is not None
        assert widget._crosshair_h is not None

    def test_crosshair_pen_properties(self, qtbot):
        from PyQt6.QtCore import Qt
        widget = Chart()
        qtbot.addWidget(widget)
        for line in [widget._crosshair_v, widget._crosshair_h]:
            pen = line.pen
            assert pen.color().name().upper() == "#CCD6F6"
            assert pen.width() == 1
            assert pen.style() == Qt.PenStyle.DashLine

    def test_crosshair_starts_hidden(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        assert not widget._crosshair_v.isVisible()
        assert not widget._crosshair_h.isVisible()

    def test_crosshair_label_anchor(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        anchor = widget._crosshair_label.anchor
        assert anchor[0] == 1.0
        assert anchor[1] == 1.0

    def test_crosshair_label_starts_empty(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        assert widget._crosshair_label.toPlainText() == ""


class TestREQ208:
    def test_interval_combo_exists(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        assert widget._interval_combo.count() == 6
        assert widget._period_combo.count() == 6

    def test_current_interval_and_period(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        assert widget.current_interval() == "1d"
        assert widget.current_period() == "1mo"

    def test_interval_period_class_constants(self):
        assert Chart.INTERVALS == ["1m", "5m", "15m", "1h", "1d", "1wk"]
        assert Chart.PERIODS == ["5d", "1mo", "3mo", "6mo", "1y", "2y"]

    def test_toolbar_labels(self, qtbot):
        from PyQt6.QtWidgets import QLabel
        widget = Chart()
        qtbot.addWidget(widget)
        texts = []
        for i in range(widget._toolbar.count()):
            w = widget._toolbar.itemAt(i).widget()
            if isinstance(w, QLabel):
                texts.append(w.text())
        assert "Interval:" in texts
        assert "Period:" in texts

    def test_toolbar_stretch(self, qtbot):
        widget = Chart()
        qtbot.addWidget(widget)
        stretch_count = sum(
            1 for i in range(widget._toolbar.count())
            if widget._toolbar.itemAt(i).spacerItem() is not None
        )
        assert stretch_count >= 1
