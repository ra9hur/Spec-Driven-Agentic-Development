import sqlite3
import os
from threading import Lock

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
DB_PATH = os.path.join(DB_DIR, "tracker.db")

_lock = Lock()
_connection: sqlite3.Connection | None = None


def get_connection() -> sqlite3.Connection:
    global _connection
    if _connection is None:
        os.makedirs(DB_DIR, exist_ok=True)
        _connection = sqlite3.connect(DB_PATH, check_same_thread=False)
        _connection.row_factory = sqlite3.Row
        _connection.execute("PRAGMA journal_mode=WAL")
        _connection.execute("PRAGMA foreign_keys=ON")
    return _connection


def init_db() -> None:
    conn = get_connection()
    with _lock:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS watchlist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL UNIQUE,
                alias TEXT DEFAULT '',
                notes TEXT DEFAULT '',
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS price_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                timestamp TIMESTAMP NOT NULL,
                open REAL,
                high REAL,
                low REAL,
                close REAL,
                volume INTEGER,
                UNIQUE(symbol, timestamp)
            );

            CREATE TABLE IF NOT EXISTS corporate_actions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                exchange TEXT,
                headline TEXT,
                body TEXT,
                published_at TIMESTAMP,
                fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(symbol, published_at, headline)
            );

            CREATE TABLE IF NOT EXISTS sentiment_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL UNIQUE,
                score REAL,
                label TEXT,
                cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS technical_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL UNIQUE,
                rsi REAL,
                macd_line REAL,
                signal_line REAL,
                sma_20 REAL,
                sma_50 REAL,
                sma_200 REAL,
                calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS layout_prefs (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
        """)
        conn.commit()


def close_db() -> None:
    global _connection
    if _connection:
        _connection.close()
        _connection = None


def add_watchlist_symbol(symbol: str) -> bool:
    conn = get_connection()
    existing = conn.execute(
        "SELECT 1 FROM watchlist WHERE LOWER(symbol) = LOWER(?)", (symbol,)
    ).fetchone()
    if existing:
        return False
    conn.execute("INSERT INTO watchlist (symbol) VALUES (?)", (symbol,))
    conn.commit()
    return True


def list_watchlist_symbols() -> list[dict]:
    conn = get_connection()
    rows = conn.execute(
        "SELECT id, symbol, alias, notes, added_at FROM watchlist ORDER BY added_at"
    ).fetchall()
    return [dict(r) for r in rows]


def update_watchlist_symbol(symbol: str, alias: str | None = None, notes: str | None = None) -> bool:
    conn = get_connection()
    updates = []
    params = []
    if alias is not None:
        updates.append("alias = ?")
        params.append(alias)
    if notes is not None:
        updates.append("notes = ?")
        params.append(notes)
    if not updates:
        return False
    params.append(symbol)
    cursor = conn.execute(f"UPDATE watchlist SET {', '.join(updates)} WHERE symbol = ?", params)
    conn.commit()
    return cursor.rowcount > 0


def remove_watchlist_symbol(symbol: str) -> bool:
    conn = get_connection()
    cursor = conn.execute("DELETE FROM watchlist WHERE symbol = ?", (symbol,))
    conn.commit()
    return cursor.rowcount > 0


def save_pref(key: str, value: str) -> None:
    conn = get_connection()
    conn.execute(
        "INSERT OR REPLACE INTO layout_prefs (key, value) VALUES (?, ?)", (key, value)
    )
    conn.commit()


def load_pref(key: str, default: str = "") -> str:
    conn = get_connection()
    row = conn.execute(
        "SELECT value FROM layout_prefs WHERE key = ?", (key,)
    ).fetchone()
    return row["value"] if row else default
