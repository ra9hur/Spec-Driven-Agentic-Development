**Main Charting Dashboard UI**

- **Role**  
    Lead UI/Frontend Engineer.
- **Task**  
    Build the `Chart(QWidget)` component — a pyqtgraph-based dual-pane dashboard that renders price candles and volume bars with crosshair tracking and configurable interval/period selectors.
- **Context**  
    The `Chart` widget in `src/ui/components/chart.py` is the central visualisation surface. It uses a `pyqtgraph.GraphicsLayoutWidget` with two vertically stacked plots: an upper price plot and a lower volume plot (linked X-axes, max height 120px). Crosshairs (dashed `InfiniteLine` objects) follow the mouse cursor. A toolbar above the canvas provides `QComboBox` selectors for interval (`1m`, `5m`, `15m`, `1h`, `1d`, `1wk`) and period (`5d`, `1mo`, `3mo`, `6mo`, `1y`, `2y`). Methods `plot_candles()`, `plot_volume_bars()`, and `plot_line()` accept data lists for rendering. `clear_series()` removes all plotted items.
- **Constraints**
    - **Background:** Canvas background must be `"#0A192F"`.
    - **Crosshairs:** Two `InfiniteLine` objects (vertical + horizontal) with `"#CCD6F6"` colour, `DashLine` style, 1px width, controlled by `SignalProxy` on `sigMouseMoved` at 60 Hz rate limit. A `TextItem` label displays cursor coordinates.
    - **Toolbar:** `QHBoxLayout` with two labelled `QComboBox` widgets.
    - **Candle Colour:** Bullish candles (`close >= open`) use `COLOR_BULLISH`; bearish candles use `COLOR_BEARISH`.
    - **Volume Bar Colour:** Based on the corresponding close value sign.
- **Format**  
    A single `Chart(QWidget)` class in `src/ui/components/chart.py`. Plotting methods append `PlotDataItem` / `BarGraphItem` references to `self._series` for cleanup.
- **Acceptance Criteria** (mapped to TestREQ106 in `tests/test_phase1_shell.py`)
    1. `test_chart_module_importable` — module imports successfully and has `Chart`.
