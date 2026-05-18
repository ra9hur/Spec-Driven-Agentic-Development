**Native GUI Main Window Shell**

- **Role**  
    Lead UI/Frontend Engineer.
- **Task**  
    Build the top-level `MainWindow` (`QMainWindow` subclass) that serves as the application shell, hosting the watchlist sidebar, charting dashboard, and collapsible gauge drawer in a horizontal splitter layout.
- **Context**  
    The `MainWindow` in `src/ui/screens/main_window.py` is the root widget of the entire PyQt6 desktop application. It sets the window title, default dimensions, and composes three child components (`Watchlist`, `Chart`, `Gauge`) inside a `QSplitter`. The left panel (watchlist) is allocated 300px and the right panel (chart + drawer) is allocated 980px. On construction, it also triggers `_restore_watchlist()` to rehydrate persisted symbols from the database.
- **Constraints**
    - **Window Geometry:** Default size is 1280×800 pixels via `self.resize(1280, 800)`.
    - **Window Title:** Must be `"StockTracker Pro"`.
    - **Layout Structure:** Exactly one `QSplitter` with `Horizontal` orientation as the central widget.
    - **Splitter Sizes:** `splitter.setSizes([300, 980])` — left panel 300px, right panel 980px.
    - **Component Composition:** Instantiates `Watchlist`, `Chart`, and `Gauge` as instance attributes; `Gauge` is initially visible and wrapped with a toggle button.
- **Format**  
    A single `MainWindow(QMainWindow)` class in `src/ui/screens/main_window.py`. Layout is built in `_build_layout()`. The gauge visibility is toggled via `_toggle_drawer()`.
- **Acceptance Criteria** (mapped to TestREQ104 in `tests/test_phase1_shell.py`)
    1. `test_main_window_module_importable` — module imports successfully and has `MainWindow`.
