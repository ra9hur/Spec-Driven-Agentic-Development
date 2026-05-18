**Lower Collapsible Drawer**

- **Role**  
    Lead UI/Frontend Engineer.
- **Task**  
    Implement a toggle mechanism that shows/hides the recommendation gauge widget in the lower portion of the right panel, with a button whose label reflects the current drawer state.
- **Context**  
    The `MainWindow._toggle_drawer()` method in `src/ui/screens/main_window.py` controls a collapsible drawer at the bottom of the right panel. The drawer consists of the `Gauge` widget and a toggle `QPushButton`. When the drawer is open, the gauge is visible and the button reads `"▼ Insights"`. When closed, the gauge is hidden and the button reads `"▲ Insights"`. The state is tracked by a private boolean `self._drawer_open`.
- **Constraints**
    - **Button Text:** Open state = `"▼ Insights"`, Closed state = `"▲ Insights"`.
    - **Widget Visibility:** `self.gauge.setVisible(self._drawer_open)`.
    - **Layout Position:** The toggle button is placed directly above the gauge widget in the right panel's `QVBoxLayout` (button → gauge stacking order).
- **Format**  
    Implemented as a private method `_toggle_drawer()` on `MainWindow` in `src/ui/screens/main_window.py`. The toggle button is created in `__init__()` and wired in `_build_layout()`.
- **Acceptance Criteria** (mapped to TestREQ110 in `tests/test_phase1_shell.py`)
    1. `test_collapsible_drawer_concept` — `assert True` (structural/placeholder test for Phase 1).
