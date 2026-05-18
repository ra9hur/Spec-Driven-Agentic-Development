**Consensus Gauge Visualization Binding**

- **Role**  
    Frontend / Qt UI Developer.
- **Task**  
    Implement a custom `QWidget` gauge that renders a filled colored ellipse with a centered consensus label.
- **Context**  
    The Gauge widget provides the visual binding for the tri-factor consensus output. Two public methods control the display:
    - `set_value(score, label)` — Direct assignment; clamps score to `[-1, 1]` and uppercases the label string.
    - `set_consensus(score, detail)` — Convenience method; derives the label from score thresholds (`> 0.2` = `BULLISH`, `< -0.2` = `BEARISH`, else `NEUTRAL`), clamps the score, and stores an optional detail string.
    
    The `paintEvent` renders an antialiased filled ellipse using `QPainter` with `RenderHint.Antialiasing`. The fill color is selected from `config/settings.py` constants (`COLOR_BULLISH` = `#10B981`, `COLOR_BEARISH` = `#EF4444`, `COLOR_NEUTRAL` = `#F59E0B`). The label is drawn centered in the widget using `Segoe UI Bold 14pt` in `#CCD6F6`. Widget minimum size is `120 x 120`.
- **Constraints**
    - **Qt6 Only:** Uses `PyQt6` — `QPainter`, `QColor`, `QFont`, `QWidget`, `Qt.AlignmentFlag`.
    - **Score Clamping:** Both setters apply `max(-1.0, min(1.0, score))` unconditionally.
    - **Label Case:** `set_value` uppercases the provided label via `.upper()`. `set_consensus` derives the label internally in all-caps.
    - **Colors from Settings:** The three gauge colors must reference the `COLOR_BULLISH`, `COLOR_BEARISH`, and `COLOR_NEUTRAL` constants defined in `config/settings.py`.
- **Format**  
    A `QWidget` subclass in `src/ui/components/gauge.py`.
- **Acceptance Criteria** (mapped to `TestREQ202` in `tests/test_phase2_wiring.py`)
    1. `test_gauge_instantiation` — After `set_value(0.8, "bullish")`, `widget._label == "BULLISH"`.
    2. `test_gauge_clamps_score` — After `set_value(5.0, "bullish")`, `widget._score == 1.0`; after `set_value(-5.0, "bearish")`, `widget._score == -1.0`.

### Module API (`src/ui/components/gauge.py`)

| Method / Attr | Signature | Returns | Notes |
|---|---|---|---|
| `Gauge().__init__` | `(parent: QWidget \| None = None) -> None` | `None` | Initial state: `_score=0.0`, `_label="NEUTRAL"`, `_detail=""`; min size `120x120` |
| `set_value` | `(score: float, label: str) -> None` | `None` | Clamps score to `[-1, 1]`; uppercases label via `.upper()`; calls `self.update()` |
| `set_consensus` | `(score: float, detail: str = "") -> None` | `None` | Derives label from score thresholds `±0.2`; clamps score; stores detail; calls `self.update()` |
| `paintEvent` | `(event) -> None` | `None` | Antialiased filled ellipse; color by label (`#10B981` / `#EF4444` / `#F59E0B`); centered `Segoe UI Bold 14pt` text in `#CCD6F6` |

---

