**Watchlist Auto-Restore on Launch**

- **Role**  
    Lead UI/Frontend Engineer.
- **Task**  
    Automatically reload persisted watchlist symbols from the database when the application starts, populating the sidebar table without user intervention.
- **Context**  
    The `MainWindow._restore_watchlist()` method in `src/ui/screens/main_window.py` is called at the end of `__init__()` after the layout is built. It queries all symbols via `list_watchlist_symbols()` and, if any exist, transforms each row into a minimal dict containing only the `symbol` key. These dicts are passed to `self.watchlist.populate()` to fill the table. This ensures that symbols added in a previous session are visible immediately on launch.
- **Constraints**
    - **Invocation:** `_restore_watchlist()` must be called during `MainWindow.__init__()` after `_build_layout()`.
    - **Data Source:** Reads from the `watchlist` table via `list_watchlist_symbols()` (ordered by `added_at`).
    - **Display Columns:** Only the `symbol` field is populated from the DB on restore; price/technical columns are filled later by background workers (Phase 2).
    - **Empty State:** If the watchlist table is empty, `populate()` is not called; the table remains empty.
- **Format**  
    Implemented as a private method `_restore_watchlist()` on `MainWindow` in `src/ui/screens/main_window.py`. Queries the database through the existing `list_watchlist_symbols()` function.
- **Acceptance Criteria** (mapped to TestREQ111 in `tests/test_phase1_shell.py`)
    1. `test_watchlist_restore_from_db` — `add_watchlist_symbol("INFY.NS")` followed by `list_watchlist_symbols()` contains `"INFY.NS"`.
