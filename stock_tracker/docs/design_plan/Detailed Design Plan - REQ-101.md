**Local Relational Storage Engine Initialization**

- **Role**  
    Lead Database Engineer / Backend Desktop Systems Developer.
- **Task**  
    Design and implement a standalone script (`config/database.py`) that handles the automated creation, configuration, connection management, table schema definition, and CRUD API of an embedded database instance.
- **Context**  
    This component serves as the absolute data foundation of **Project Chakra**. Before any UI components (Phase 1) or background network workers (Phase 2) can store or retrieve stock tickers, this storage layer must successfully initialize. It will operate locally on the user's filesystem as a single zero-dependency file database container (`data/tracker.db`). Beyond schema initialization, the module also exposes full CRUD operations for the watchlist and a generic key-value preference store for UI settings persistence.
- **Constraints**
    - **Technology Constraint:** Must utilize only the native Python built-in `sqlite3` driver block. No external ORMs (such as SQLAlchemy) are permitted to ensure zero extra runtime installation overhead.
    - **Thread Safety:** All DDL operations are serialized under a `threading.Lock`. CRUD functions share a single connection opened with `check_same_thread=False` and WAL journal mode. This is acceptable because all database access targets the local filesystem with negligible contention.
    - **I/O Execution Rules:** All DDL (Data Definition Language) commands must include conditional checks (`IF NOT EXISTS`) to prevent app crashes or metadata rewrites on subsequent restarts.
- **Format**  
    The implementation is packaged as a production-grade Python script at `config/database.py`. It uses raw multi-line SQL schema definitions. `init_db()` returns `None`; boolean return values are used by the CRUD helpers to indicate success/failure. Minimal error handling exists — only `IntegrityError` is caught in `add_watchlist_symbol()`. No docstrings are present on the functions.
- **Acceptance Criteria**
    1. **File Creation Verification:** Executing `init_db()` triggers `get_connection()`, which checks for the `data/` directory, creates it if missing via `os.makedirs(..., exist_ok=True)`, and connects to `tracker.db`. The file and directory are created lazily on first PRAGMA execution.
    2. **Schema Integrity:** `init_db()` must instantiate 6 tables with `IF NOT EXISTS` guards:
       - `watchlist(symbol TEXT UNIQUE, alias, notes, added_at)`
       - `price_history(symbol, timestamp, open, high, low, close, volume)`
       - `corporate_actions(symbol, exchange, headline, body, published_at)`
       - `sentiment_cache(symbol UNIQUE, score, label)`
       - `technical_cache(symbol UNIQUE, rsi, macd_line, signal_line, sma_20, sma_50, sma_200)`
       - `layout_prefs(key TEXT PRIMARY KEY, value TEXT)`
       No foreign-key constraints are used; referential integrity is enforced by application logic.
    3. **Performance:** The `watchlist` table relies on the implicit unique index from the `UNIQUE` constraint on the `symbol` column. No explicit `CREATE INDEX` statement is issued.
    4. **Graceful Recovery & Tests:** `get_connection()` does not handle corrupt-DB errors — a `sqlite3.DatabaseError` propagates uncaught (future enhancement candidate). All REQ-101 tests in `test_phase1_shell.py` pass against the isolated in-memory SQLite fixture defined in `conftest.py`.

### Module API (`config/database.py`)

| Function | Signature | Returns | Notes |
|---|---|---|---|
| `get_connection()` | `() -> Connection` | `sqlite3.Connection` | Singleton; creates dir + file lazily; sets WAL + foreign_keys PRAGMAs |
| `init_db()` | `() -> None` | `None` | Creates all 6 tables atomically under `threading.Lock` |
| `close_db()` | `() -> None` | `None` | Closes the global connection singleton |
| `add_watchlist_symbol()` | `(symbol: str) -> bool` | `bool` | `False` on duplicate (`IntegrityError`) |
| `list_watchlist_symbols()` | `() -> list[dict]` | `list[dict]` | Ordered by `added_at` ascending |
| `update_watchlist_symbol()` | `(symbol, alias?, notes?) -> bool` | `bool` | Partial update of provided fields |
| `remove_watchlist_symbol()` | `(symbol: str) -> bool` | `bool` | Deletes the matching row |
| `save_pref()` | `(key: str, value: str) -> None` | `None` | Upsert into `layout_prefs` |
| `load_pref()` | `(key: str, default='') -> str` | `str` | Returns `default` if key absent |

---

