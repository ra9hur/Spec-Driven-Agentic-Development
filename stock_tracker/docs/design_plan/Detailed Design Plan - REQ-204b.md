**Candlestick and Volume Bar Series Rendering**

- **Role**  
    Lead UI / Visualization Engineer.
- **Task**  
    Design and implement the `plot_candles()` and `plot_volume_bars()` methods on the `Chart` widget to render OHLCV data as candlestick bodies/wicks and volume histogram bars respectively.
- **Context**  
    Candlestick charts are the standard visualization for financial time-series data. Each candle consists of a vertical wick (high-to-low line) and a thicker body (open-to-close line). Green indicates a bullish candle (close >= open); red indicates bearish (close < open). Volume bars below the price chart mirror the same color convention. Both methods append their generated `PlotDataItem` and `BarGraphItem` objects to the `_series` list for lifecycle tracking. The implementation lives in `src/ui/components/chart.py`.
- **Constraints**
    - **Candle Geometry:** Wicks are `PlotDataItem` with `width=1.5` pen; bodies are `PlotDataItem` with `width=4` pen. Both share the same color. X coordinate is the same for both.
    - **Color Source:** Colors come from `config.settings.COLOR_BULLISH` (`#10B981`) and `COLOR_BEARISH` (`#EF4444`).
    - **Volume Bars:** Use `pg.BarGraphItem(x=t, height=v, width=0.6, brush=color)` with transparent pen. Color determined by close value vs 0 (not vs open for volume).
    - **Series Tracking:** All created items are appended to `self._series` list so `clear_series()` can remove them later.
    - **Clear Before Plot:** `plot_candles()` calls `self.clear_series()` before rendering to avoid overlay.
- **Format**  
    Both methods iterate zipped OHLCV arrays and construct individual items. No aggregation or caching.
- **Acceptance Criteria**
    1. **Candles Render:** `plot_candles([1,2], [100,102], [105,107], [98,100], [102,103])` populates `widget._series` with items; `len(widget._series) > 0` (TestREQ204b::test_plot_candles).
    2. **Wick & Body Pairing:** Each candle produces two `PlotDataItem` entries in `_series` (wick line + body line), 4 items total for 2 candles.
    3. **Volume Bars Render:** `plot_volume_bars()` produces `BarGraphItem` entries in `_series`.
    4. **Color Logic:** Close >= open produces `COLOR_BULLISH`; otherwise `COLOR_BEARISH`.

### Module API (`src/ui/components/chart.py` — rendering methods)

| Method | Signature | Returns | Notes |
|---|---|---|---|
| `plot_candles()` | `(times, opens, highs, lows, closes) -> None` | `None` | Clears series first; draws wicks + bodies per candle |
| `plot_volume_bars()` | `(times, volumes, closes) -> None` | `None` | Draws `BarGraphItem` per bar; color by close direction |
| `_series` | `list[pg.PlotDataItem | pg.BarGraphItem]` | Attribute | Tracks all plotted items for `clear_series()` |

---

