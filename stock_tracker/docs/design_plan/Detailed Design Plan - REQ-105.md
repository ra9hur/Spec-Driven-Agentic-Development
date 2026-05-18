**Watchlist Navigation Sidebar UI**

- **Role**  
    Lead UI/Frontend Engineer.
- **Task**  
    Implement the `Watchlist(QWidget)` component — a collapsible sidebar table widget that displays tracked stock symbols, prices, and technical signals, and provides a search bar for adding new tickers.
- **Context**  
    The `Watchlist` widget in `src/ui/components/watchlist.py` is the primary navigation tool for the user. It contains a `QTableWidget` with five columns (`Symbol`, `Price`, `Change %`, `RSI`, `Signal`), a `QLineEdit` search bar, and an `Add` button. The widget emits `symbol_submitted` (when a valid symbol is added) and `symbol_selected` (when a row is double-clicked) `pyqtSignal` instances. The `populate(rows)` method fills the table from a list of dicts returned by `list_watchlist_symbols()`.
- **Constraints**
    - **Table Configuration:** `QTableWidget` with 5 columns; `NoEditTriggers` (read-only); `SelectRows` selection behaviour; vertical header hidden; stretch-last-section resize mode.
    - **Signals:** Two custom signals: `symbol_submitted = pyqtSignal(str)` and `symbol_selected = pyqtSignal(str)`.
    - **Input Validation:** The search input feeds into `_submit_symbol()` which validates via `_SYMBOL_RE` before calling `add_watchlist_symbol()`.
    - **Populate Format:** `populate()` expects a list of dicts with keys `symbol`, `price`, `change_pct`, `rsi`, `signal`. The `change_pct` cell is coloured green (`COLOR_BULLISH`) for non-negative and red (`COLOR_BEARISH`) for negative.
- **Format**  
    A single `Watchlist(QWidget)` class in `src/ui/components/watchlist.py`. Layout uses `QVBoxLayout` with zero margins.
- **Acceptance Criteria** (mapped to TestREQ105 in `tests/test_phase1_shell.py`)
    1. `test_watchlist_module_importable` — module imports successfully and has `Watchlist`.
