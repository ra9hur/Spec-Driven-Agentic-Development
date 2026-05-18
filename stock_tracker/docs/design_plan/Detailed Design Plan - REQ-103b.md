**Watchlist List Tickers**

- **Role**  
    Lead Database Engineer / Backend Desktop Systems Developer.
- **Task**  
    Expose a CRUD function `list_watchlist_symbols() -> list[dict]` that returns all watchlist rows ordered by insertion time.
- **Context**  
    This function provides read access to the watchlist for UI population (`Watchlist.populate()`) and for auto-restore on launch (`MainWindow._restore_watchlist()`). It selects `id`, `symbol`, `alias`, `notes`, and `added_at` columns, ordered ascending by `added_at`. Each row is returned as a dictionary via `sqlite3.Row` + `dict()` conversion.
- **Constraints**
    - **Sort Order:** Results must be ordered by `added_at` in ascending order (oldest first).
    - **Column Set:** Only `id`, `symbol`, `alias`, `notes`, `added_at` are returned. Price/technical columns are not included.
    - **Empty State:** An empty watchlist returns an empty Python list (`[]`).
- **Format**  
    A standalone function in `config/database.py`. Uses `conn.execute(...).fetchall()` followed by list comprehension `[dict(r) for r in rows]`.
- **Acceptance Criteria** (mapped to TestREQ103b in `tests/test_phase1_shell.py`)
    1. `test_list_watchlist_symbols` — after adding one symbol, the list length is 1 and `symbols[0]["symbol"] == NSE_SYMBOL`.
    2. `test_list_empty_watchlist` — returns `[]`.

### Module API (`config/database.py`)

| Function | Signature | Returns | Notes |
|---|---|---|---|
| `list_watchlist_symbols()` | `() -> list[dict]` | `list[dict]` | Ordered by `added_at` ascending; each dict has `id`, `symbol`, `alias`, `notes`, `added_at` |
