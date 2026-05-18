**Interval and Period Configuration Toggles**

- **Role**  
    Lead UI / Visualization Engineer.
- **Task**  
    Design and implement the interval and period selector combo boxes as part of the `Chart` widget toolbar, enabling users to switch between time granularities and lookback windows.
- **Context**  
    Users need to dynamically change the data resolution (interval) and historical range (period) of the chart. Two `QComboBox` widgets are arranged in a horizontal toolbar (`_toolbar`) at the top of the `Chart` widget. The interval combo offers `["1m", "5m", "15m", "1h", "1d", "1wk"]` and defaults to `"1d"`. The period combo offers `["5d", "1mo", "3mo", "6mo", "1y", "2y"]` and defaults to `"1mo"`. Public accessors `current_interval()` and `current_period()` return the currently selected values. Implementation is in `src/ui/components/chart.py`.
- **Constraints**
    - **Combo Values:** `INTERVALS = ["1m", "5m", "15m", "1h", "1d", "1wk"]` and `PERIODS = ["5d", "1mo", "3mo", "6mo", "1y", "2y"]` — both as class-level constants.
    - **Defaults:** Interval defaults to `"1d"`; period defaults to `"1mo"`. Set via `_interval = "1d"` and `_period = "1mo"` in `__init__`, then `setCurrentText()` on each combo.
    - **Layout:** A `QHBoxLayout` containing `QLabel("Interval:")`, interval combo, `QLabel("Period:")`, period combo, followed by a stretch.
    - **Label Styling:** Labels have stylesheet `"color: #CCD6F6;"` for visibility on dark background.
    - **No Side-Effects:** Combo box changes do not trigger data fetches — they are passive selectors. External code reads the current values via the accessor methods.
- **Format**  
    The toolbar is built by `_build_toolbar()` called from `__init__()`. Accessor methods are one-liners returning `currentText()`.
- **Acceptance Criteria**
    1. **Combo Existence:** `widget._interval_combo.count() == 6` and `widget._period_combo.count() == 6` (TestREQ208::test_interval_combo_exists).
    2. **Default Values:** `current_interval()` returns `"1d"` and `current_period()` returns `"1mo"` on a freshly constructed `Chart` (TestREQ208::test_current_interval_and_period).
    3. **Class Constants:** `Chart.INTERVALS` and `Chart.PERIODS` contain the correct 6 values each.
    4. **Toolbar Layout:** Toolbar is a `QHBoxLayout` containing labels and combo boxes, added above the canvas.

### Module API (`src/ui/components/chart.py` — toolbar)

| Attribute / Method | Type / Signature | Notes |
|---|---|---|
| `INTERVALS` | `list[str]` | Class constant: `["1m","5m","15m","1h","1d","1wk"]` |
| `PERIODS` | `list[str]` | Class constant: `["5d","1mo","3mo","6mo","1y","2y"]` |
| `_interval_combo` | `QComboBox` | Instantiated in `_build_toolbar()`; default `"1d"` |
| `_period_combo` | `QComboBox` | Instantiated in `_build_toolbar()`; default `"1mo"` |
| `_build_toolbar()` | `() -> None` | Creates `QHBoxLayout` with labels + combos + stretch |
| `current_interval()` | `() -> str` | Returns `self._interval_combo.currentText()` |
| `current_period()` | `() -> str` | Returns `self._period_combo.currentText()` |

---

