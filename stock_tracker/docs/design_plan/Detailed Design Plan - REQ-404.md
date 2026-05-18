**Local Data Storage Footprint Constraints**

- **Role**  
    Lead Database / Storage Engineer.
- **Task**  
    Verify that the database storage directory (`data/`) exists on disk, confirming the local storage footprint is correctly initialised.
- **Context**  
    The application stores its SQLite database at a path derived from `config.database.DB_PATH`. The parent directory must be created by `init_db` / `get_connection` during startup. This NFR gate ensures the storage directory is present regardless of whether a full database test has been executed.
- **Constraints**
    - **Directory Existence:** The test checks `os.path.isdir(os.path.dirname(DB_PATH))` — must return `True`.
    - **No Side Effects:** The test reads `DB_PATH` from `config.database` but does not call `init_db` itself; it relies on prior initialisation (e.g., from a fixture or earlier test).
- **Format**  
    Single test class `TestREQ404` in `tests/test_phase4_nfr_gates.py` with method `test_database_storage_footprint`. Imports `DB_PATH` from `config.database` and asserts the parent directory exists.
- **Acceptance Criteria**
    1. **Data Directory Exists:** `os.path.isdir(os.path.dirname(DB_PATH))` evaluates to `True`.
    2. **Importable Path Constant:** `DB_PATH` is a well-defined string constant in `config.database`.
- **Module API** (via `config/database.py`)

    | Constant / Function | Signature | Returns | Notes |
    |---|---|---|---|
    | `DB_PATH` | module-level constant `str` | `str` | Full path to `data/tracker.db` |
    | `get_connection()` | `() -> Connection` | `sqlite3.Connection` | Creates `data/` dir via `os.makedirs(..., exist_ok=True)` on first call |

---

