**Watchlist Remove Ticker**

- **Role**  
    Lead Database Engineer / Backend Desktop Systems Developer.
- **Task**  
    Expose a CRUD function `remove_watchlist_symbol(symbol: str) -> bool` that deletes a single watchlist entry by symbol and reports whether a row was removed.
- **Context**  
    This is the delete-path for watchlist management. The function executes a parameterised `DELETE` query keyed on the `symbol` column. It relies on `conn.total_changes > 0` to distinguish a successful deletion from a no-op (symbol not found).
- **Constraints**
    - **Exact Match:** Deletion is by exact symbol string match. No fuzzy or partial matching.
    - **Return Convention:** Returns `True` if a row was deleted, `False` if no matching symbol was found.
    - **Cascade:** No foreign-key cascades exist; deleting a watchlist symbol does not touch `price_history` or other tables.
- **Format**  
    A standalone function in `config/database.py`. `symbol` is bound via `?` placeholder. `conn.commit()` is called after execution.
- **Acceptance Criteria** (mapped to TestREQ103d in `tests/test_phase1_shell.py`)
    1. `test_remove_watchlist_symbol` — returns `True` and `symbols == []`.

### Module API (`config/database.py`)

| Function | Signature | Returns | Notes |
|---|---|---|---|
| `remove_watchlist_symbol()` | `(symbol: str) -> bool` | `bool` | Deletes the matching row; returns `True` if a row was removed |
