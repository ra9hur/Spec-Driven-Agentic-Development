**Chart Crosshair Tracking Labels**

- **Role**  
    Lead UI / Visualization Engineer.
- **Task**  
    Design and implement crosshair tracking lines and a coordinate tooltip on the `Chart` widget using `pg.InfiniteLine` items and a `SignalProxy` on `sigMouseMoved`.
- **Context**  
    Traders need precise visual reference lines to read values off the chart. Two `InfiniteLine` objects (`_crosshair_v` vertical, `_crosshair_h` horizontal) are added to the price plot. A `SignalProxy` throttles mouse-move events (60ms rate limit) and calls `_mouse_moved()`, which repositions the crosshair lines and updates a `TextItem` tooltip showing the current (x, y) coordinates. Crosshairs are hidden by default and become visible only when the mouse is over the plot area. Implementation is in `src/ui/components/chart.py`.
- **Constraints**
    - **Line Style:** Dashed lines (`Qt.PenStyle.DashLine`), `#CCD6F6` color, width=1.
    - **InfiniteLine Config:** `angle=90` for vertical, `angle=0` for horizontal; both `movable=False`.
    - **Signal Proxy:** `pg.SignalProxy(price_plot.scene().sigMouseMoved, rateLimit=60, slot=_mouse_moved)`.
    - **Visibility:** Both lines start hidden (`setVisible(False)`). Shown on hover inside scene bounding rect.
    - **Tooltip:** `pg.TextItem` with HTML formatting `<span style="color:#CCD6F6; font-size:10px;">x=... y=...</span>`; anchored at `(1, 1)` (bottom-right of text relative to cursor).
- **Format**  
    Crosshair setup occurs in `Chart.__init__()`. The `_mouse_moved` slot handles position updates and visibility toggling.
- **Acceptance Criteria**
    1. **Crosshair Items Exist:** After `Chart()` instantiation, `widget._crosshair_v` and `widget._crosshair_h` are both not `None` (TestREQ207::test_crosshair_items_exist).
    2. **Line Properties:** Both lines have `#CCD6F6` pen color, `DashLine` style, and are not movable.
    3. **Visibility Toggle:** Crosshairs are hidden by default and shown when the mouse enters the plot area.
    4. **Tooltip Display:** `_crosshair_label` is a `pg.TextItem` added to the price plot, showing formatted coordinates.

### Module API (`src/ui/components/chart.py` — crosshair)

| Attribute / Method | Type / Signature | Notes |
|---|---|---|
| `_crosshair_v` | `pg.InfiniteLine(angle=90)` | Vertical dashed line, `#CCD6F6`, hidden by default |
| `_crosshair_h` | `pg.InfiniteLine(angle=0)` | Horizontal dashed line, `#CCD6F6`, hidden by default |
| `_proxy` | `pg.SignalProxy` | Rate-limited (60ms) connection to `sigMouseMoved` |
| `_mouse_moved()` | `(evt) -> None` | Updates crosshair positions; shows/hides based on `sceneBoundingRect().contains(pos)` |
| `_crosshair_label` | `pg.TextItem` | HTML-formatted coordinate tooltip anchored at `(1, 1)` |

---

