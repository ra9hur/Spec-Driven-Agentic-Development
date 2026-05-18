**Watchlist Update Ticker**

- **Role**  
    Lead Database Engineer / Backend Desktop Systems Developer.
- **Task**  
    Expose a CRUD function `update_watchlist_symbol(symbol, alias=None, notes=None) -> bool` that partially updates the `alias` and `notes` columns of an existing watchlist entry.
- **Context**  
    The function dynamically builds a parameterised `UPDATE` query containing only the fields where a non-`None` value is supplied. This allows callers to update either field independently without needing to re-specify the other value. The function checks `conn.total_changes > 0` to report whether any row was actually modified.
- **Constraints**
    - **Partial Update:** Only `alias` and `notes` are updateable. The `symbol` itself is immutable and serves as the `WHERE` filter.
    - **Null Semantics:** A parameter value of `None` means "do not update this column". An empty string `""` is treated as an explicit value (clears the field).
    - **No-Op Guard:** If both `alias` and `notes` are `None`, the function returns `False` immediately without executing a query.
    - **Return Convention:** Returns `True` if at least one row was updated, `False` otherwise (including no-op).
- **Format**  
    A standalone function in `config/database.py`. Comma-separated `SET` clauses are joined from non-`None` field names. The symbol is appended as the final parameter in the params list. `conn.commit()` is called explicitly.
- **Acceptance Criteria** (mapped to TestREQ103c in `tests/test_phase1_shell.py`)
    1. `test_update_watchlist_alias` — returns `True` and `symbols[0]["alias"] == "RIL"`.

### Module API (`config/database.py`)

| Function | Signature | Returns | Notes |
|---|---|---|---|
| `update_watchlist_symbol()` | `(symbol, alias?, notes?) -> bool` | `bool` | Partial update of provided fields; returns `False` if no fields provided or no row matched |
