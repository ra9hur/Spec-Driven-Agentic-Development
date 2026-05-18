**Recommendation Gauge UI**

- **Role**  
    Lead UI/Frontend Engineer.
- **Task**  
    Implement the `Gauge(QWidget)` component — a custom-painted circular indicator that visualises the aggregate recommendation score (BULLISH / NEUTRAL / BEARISH) for the currently selected ticker.
- **Context**  
    The `Gauge` widget in `src/ui/components/gauge.py` is drawn entirely via `QPainter.paintEvent()`. It draws a filled ellipse with colour determined by the current label: `COLOR_BULLISH` (`#10B981`, green) for `"BULLISH"`, `COLOR_BEARISH` (`#EF4444`, red) for `"BEARISH"`, and `COLOR_NEUTRAL` (`#F59E0B`, amber) as the default. The label text is rendered centred in the widget in a bold 14pt `"Segoe UI"` font with `#CCD6F6` colour. Two public methods are exposed: `set_value(score, label)` for direct control and `set_consensus(score, detail)` for automatic label derivation (thresholds: `> 0.2` = BULLISH, `< -0.2` = BEARISH, otherwise NEUTRAL).
- **Constraints**
    - **Minimum Size:** `setMinimumSize(120, 120)` — gauge must not shrink below 120×120 px.
    - **Colour Constants:** BULLISH = `"#10B981"`, BEARISH = `"#EF4444"`, NEUTRAL = `"#F59E0B"` (imported from `config.settings`).
    - **Score Clamping:** Scores are clamped to `[-1.0, 1.0]` via `max(-1.0, min(1.0, score))`.
    - **Label Uppercasing:** All labels are uppercased via `.upper()` in `set_value()`.
- **Format**  
    A single `Gauge(QWidget)` class in `src/ui/components/gauge.py`. Painting uses `QPainter` with `Antialiasing` render hint.
- **Acceptance Criteria** (mapped to TestREQ107 in `tests/test_phase1_shell.py`)
    1. `test_gauge_module_importable` — module imports successfully and has `Gauge`.
