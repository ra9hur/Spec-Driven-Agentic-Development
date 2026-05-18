**Watchlist Add Ticker**

- **Role**  
    Lead Database Engineer / Backend Desktop Systems Developer.
- **Task**  
    Expose a CRUD function `add_watchlist_symbol(symbol: str) -> bool` that inserts a new symbol into the `watchlist` table and reports success or duplicate failure.
- **Context**  
    This is the primary write-path for watchlist management. The function is called by `Watchlist._submit_symbol()` after regex validation passes. It relies on the `UNIQUE` constraint on the `symbol` column to detect duplicates; no application-level uniqueness check is performed beforehand. A duplicate insert raises `sqlite3.IntegrityError`, which is caught and returns `False`.
- **Constraints**
    - **Technology Constraint:** Only the standard library `sqlite3` module is used. The function operates on the singleton connection obtained via `get_connection()`.
    - **Uniqueness:** The `watchlist.symbol` column has a `UNIQUE` constraint; the function relies on the database engine to enforce this. No `SELECT`-before-`INSERT` guard.
    - **Return Convention:** Returns `True` on successful insert, `False` on duplicate. Other exceptions propagate uncaught.
- **Format**  
    A standalone function in `config/database.py`. The symbol is bound as a positional parameter via `?` placeholder. `conn.commit()` is called after every successful insert.
- **Acceptance Criteria** (mapped to TestREQ103a in `tests/test_phase1_shell.py`)
    1. `test_add_watchlist_symbol` — `add_watchlist_symbol(NSE_SYMBOL)` returns `True`.
    2. `test_add_duplicate_rejected` — second call with the same symbol returns `False`.

### Module API (`config/database.py`)

| Function | Signature | Returns | Notes |
|---|---|---|---|
| `add_watchlist_symbol()` | `(symbol: str) -> bool` | `bool` | `False` on duplicate (`IntegrityError`); inserts `symbol` only |
