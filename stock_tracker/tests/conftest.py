import pytest
import sqlite3
from config.database import init_db, get_connection, close_db


@pytest.fixture(autouse=True)
def isolated_db(monkeypatch) -> None:
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
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
            open REAL, high REAL, low REAL, close REAL, volume INTEGER,
            UNIQUE(symbol, timestamp)
        );
        CREATE TABLE IF NOT EXISTS corporate_actions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol TEXT NOT NULL, exchange TEXT, headline TEXT, body TEXT,
            published_at TIMESTAMP, fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(symbol, published_at, headline)
        );
        CREATE TABLE IF NOT EXISTS sentiment_cache (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol TEXT NOT NULL UNIQUE, score REAL, label TEXT,
            cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS technical_cache (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol TEXT NOT NULL UNIQUE, rsi REAL, macd_line REAL, signal_line REAL,
            sma_20 REAL, sma_50 REAL, sma_200 REAL,
            calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS layout_prefs (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
    """)
    monkeypatch.setattr("config.database.get_connection", lambda: conn)
    yield
    conn.close()
