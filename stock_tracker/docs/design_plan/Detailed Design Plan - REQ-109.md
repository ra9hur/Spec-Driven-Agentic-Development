**Ticker Search Input Bar**

- **Role**  
    Lead UI/Frontend Engineer.
- **Task**  
    Implement the symbol search input bar and Add button at the top of the watchlist sidebar, including client-side regex validation before the symbol hits the database layer.
- **Context**  
    The search input is a `QLineEdit` with placeholder text `"Enter symbol (e.g. RELIANCE.NS)"`, placed above an `Add` `QPushButton` at the top of the `Watchlist` widget layout. When the user presses Enter or clicks Add, `_submit_symbol()` is called. The method strips whitespace, uppercases the input, and matches against `_SYMBOL_RE` (regex: `^[A-Z0-9]+\.(NS|BO)$`). On match, it calls `add_watchlist_symbol(raw)` and emits `symbol_submitted` on success. On mismatch, the input is silently cleared without a database call.
- **Constraints**
    - **Placeholder:** `QLineEdit.setPlaceholderText("Enter symbol (e.g. RELIANCE.NS)")`.
    - **Trigger:** Both `returnPressed` signal on the `QLineEdit` and `clicked` signal on the `Add` button invoke `_submit_symbol()`.
    - **Silent Rejection:** Invalid symbols are silently rejected (input cleared, no dialog, no database call).
    - **Database Integration:** Only calls `add_watchlist_symbol()` if the regex matches; the `symbol_submitted` signal is emitted only on successful DB insert (`add_watchlist_symbol` returns `True`).
- **Format**  
    Implemented as part of the `Watchlist` class in `src/ui/components/watchlist.py`. The search bar and button are created in `__init__()` and added to the `QVBoxLayout`. Validation lives in the private `_submit_symbol()` method.
- **Acceptance Criteria** (mapped to TestREQ109 in `tests/test_phase1_shell.py`)
    1. `test_search_input_accepts_nse_symbol` — `pattern.match("RELIANCE.NS")` is truthy, `pattern.match("TCS.BO")` is truthy, `pattern.match("invalid")` is `None`.
