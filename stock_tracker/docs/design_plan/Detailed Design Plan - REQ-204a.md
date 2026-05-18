**PyQtGraph Viewport Embedding and Axis Configuration**

- **Role**  
    Lead UI / Visualization Engineer.
- **Task**  
    Design and implement the `Chart` widget's embedded PyQtGraph viewport with a two-panel layout (price plot top, volume plot bottom) including axis labels, grid lines, and synchronized horizontal scrolling via `setXLink`.
- **Context**  
    The `Chart` widget at `src/ui/components/chart.py` is the primary visualization surface. It uses `pg.GraphicsLayoutWidget` as the canvas. Two subplots are stacked vertically: `_price_plot` (top) for candlestick and line series, and `_volume_plot` (bottom) for volume histogram bars. The volume plot is linked to the price plot's X-axis so that zooming/panning horizontally keeps both panels in sync. Grid lines and axis labels are enabled for both subplots.
- **Constraints**
    - **Layout Engine:** Use `pg.GraphicsLayoutWidget.addPlot()` for the first plot and `nextRow()` + `addPlot()` for the second. No custom `ViewBox` or `GraphicsView` subclassing.
    - **Axis Linking:** `_volume_plot.setXLink(self._price_plot)` — required for synchronized horizontal scrolling.
    - **Grid Lines:** `showGrid(x=True, y=True, alpha=0.3)` on price plot, `alpha=0.2` on volume plot.
    - **Labels:** Left axis label `"Price"` on price plot, `"Volume"` on volume plot. Bottom axis label `"Time"` on price plot.
    - **Background:** Canvas background set to `"#0A192F"`.
- **Format**  
    The two-panel layout is configured inside `Chart.__init__()`. The volume plot has a fixed max height of 120px via `setMaximumHeight(120)`.
- **Acceptance Criteria**
    1. **Price Plot Exists:** After `Chart()` instantiation, `widget._price_plot` is not `None` (TestREQ204a::test_chart_has_price_plot).
    2. **Layout Structure:** `_price_plot` is the first plot added; `_canvas.nextRow()` separates it from `_volume_plot`.
    3. **Axis Synchronization:** `_volume_plot.setXLink(self._price_plot)` is called, linking the volume plot's horizontal axis to the price plot.
    4. **Grid Lines:** Both plots have grid lines enabled with respective alpha values.

### Module API (`src/ui/components/chart.py` — layout section)

| Attribute / Call | Type / Signature | Notes |
|---|---|---|
| `_canvas` | `pg.GraphicsLayoutWidget` | Main canvas; background `#0A192F` |
| `_price_plot` | `pg.PlotItem` | First subplot; title `"Price Chart"`; grid alpha 0.3 |
| `_volume_plot` | `pg.PlotItem` | Second subplot; title `"Volume"`; grid alpha 0.2; max height 120; X-linked to price |
| `_canvas.nextRow()` | `() -> None` | Advances layout row before adding volume plot |
| `setXLink()` | `(plot) -> None` | Links volume X axis to price plot for sync zoom/pan |

---

