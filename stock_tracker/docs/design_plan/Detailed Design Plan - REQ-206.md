**Volume Bar Histogram Rendering**

- **Role**  
    Lead UI / Visualization Engineer.
- **Task**  
    Design and implement the `plot_volume_bars(times, volumes, closes)` method on the `Chart` widget to render volume data as colored histogram bars on the synced volume subplot.
- **Context**  
    Volume bars provide visual context for trading activity. Each bar corresponds to a single time period and is drawn on the `_volume_plot` subplot (the bottom panel). The bar color indicates price movement direction during that period: green when the close price is positive (or non-negative), red otherwise. All generated `BarGraphItem` objects are appended to `_series` for lifecycle tracking so they can be cleared by `clear_series()`. The implementation is in `src/ui/components/chart.py`.
- **Constraints**
    - **Rendering Primitive:** Use `pg.BarGraphItem` exclusively. Each bar is a separate `BarGraphItem` instance.
    - **Bar Appearance:** Width=0.6, brush color from settings, no pen outline (`pg.mkPen(None)`).
    - **Color Logic:** `COLOR_BULLISH` (`#10B981`) if `close >= 0`, otherwise `COLOR_BEARISH` (`#EF4444`). Note: volume bar color uses close value direction (not open comparison).
    - **Placement:** All bars are added to `self._volume_plot`, not `_price_plot`.
    - **Series Tracking:** Each bar is appended to `self._series`.
- **Format**  
    The method iterates `zip(times, volumes, closes)` in a single pass, constructing one `BarGraphItem` per tuple.
- **Acceptance Criteria**
    1. **Volume Bars Render:** `plot_volume_bars([1, 2], [1000, 2000], [105, 98])` executes without error and populates `_series` (TestREQ206::test_plot_volume_bars).
    2. **Volume Plot Exists:** After calling `plot_volume_bars`, `widget._volume_plot` is not `None`.
    3. **Bar Colors:** Bars with `close >= 0` use `COLOR_BULLISH` brush; bars with `close < 0` use `COLOR_BEARISH`.
    4. **Axis Sync:** Volume bars appear on `_volume_plot` which is X-linked to `_price_plot`.

### Module API (`src/ui/components/chart.py` — volume bars)

| Method | Signature | Returns | Notes |
|---|---|---|---|
| `plot_volume_bars()` | `(times: list, volumes: list, closes: list) -> None` | `None` | Iterates zipped data; creates `BarGraphItem` per bar |
| `_volume_plot` | `pg.PlotItem` | Attribute | Bottom subplot; max height 120px; X-linked to price plot |

---

