**Continuous Axis Interactivity Controllers**

- **Role**  
    Lead UI / Visualization Engineer.
- **Task**  
    Design and implement the `clear_series()` method on the `Chart` widget and leverage PyQtGraph's built-in mouse interaction (zoom, pan) to provide continuous axis interactivity.
- **Context**  
    Financial chart users expect to zoom into regions of interest and pan across time. PyQtGraph provides zoom (scroll wheel) and pan (click-drag) out of the box via the `ViewBox` attached to each `PlotItem`. The `clear_series()` method is the explicit programmatic reset — it removes all plotted items (candles, lines, volume bars) from both subplots and clears the `_series` list. This is called before each new `plot_candles()` to prevent stale data overlay.
- **Constraints**
    - **Built-in Interactivity:** No custom mouse handlers for zoom/pan. PyQtGraph's default `ViewBox` interactions suffice.
    - **Clear Both Plots:** `clear_series()` iterates `_series` and calls `plot.removeItem(item)` on both `_price_plot` and `_volume_plot`. Exceptions during removal are silently caught.
    - **List Reset:** After removal, `_series.clear()` resets the tracking list to empty.
    - **No Auto-Range:** The method does not call `autoRange()` or reset view state — the user's current zoom/pan is preserved.
- **Format**  
    `clear_series()` is a single method on the `Chart` class. No separate controller class.
- **Acceptance Criteria**
    1. **Clear Removes Items:** After `plot_line([1,2], [10,20])` the series count is 1; after `clear_series()` the count is 0 (TestREQ205::test_chart_clear_series).
    2. **Both Plots Cleaned:** Items plotted on `_price_plot` and `_volume_plot` are all removed.
    3. **Idempotent:** Calling `clear_series()` on an already-empty `_series` list does not raise.
    4. **Built-in Zoom/Pan:** Scroll wheel zooms; click-drag pans in both subplots; X-axis of volume plot follows price plot via `setXLink`.

### Module API (`src/ui/components/chart.py` — interactivity)

| Method | Signature | Returns | Notes |
|---|---|---|---|
| `clear_series()` | `() -> None` | `None` | Removes all items from both plots; clears `_series` list |
| `_series` | `list[pg.PlotDataItem \| pg.BarGraphItem]` | Attribute | Mutable list of all currently plotted items |

---

