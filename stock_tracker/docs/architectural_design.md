# System Architecture & Technical Design Document

**Target Architecture:** Desktop Application (Single-User Model)
**Implementation Runtime:** Python 3.12 + Conda Environment

---

## 1. Architectural Style & Design Patterns

The application enforces a strict **Decoupled Model-View-Controller/Worker (MVC-W)** separation pattern. This architecture ensures that heavy network I/O, file modifications, and computational operations are isolated from the rendering loops.

```
       ┌──────────────────────────────────────────────────────────────┐
       │                   PyQt6 GUI Main Thread                      │
       │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
       │  │  Watchlist   │  │  Chart       │  │  Gauge/Drawer    │   │
       │  │  (QWidget)   │  │  (QWidget)   │  │  (QWidget)       │   │
       │  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘   │
       └─────────┼─────────────────┼────────────────────┼─────────────┘
                 │ User Action     │ Qt Signal Updates  │ Consensus
                 │ (Add/Select)    │ (Processed Data)   │ Score
                 ▼                 │                    │
       ┌───────────────────┐       ▼                    ▼
       │ SQLite DB Manager │  ┌───────────────────────────┐
       │ (Thread-safe Lock)│  │   DataWorker (QThread)    │
       │                   │  │   RateLimiter (Token)     │
       │ watchlist         │  │   Retry Handler (3x)     │
       │ price_history     │  └─────────────▲─────────────┘
       │ corporate_actions │                │
       │ sentiment_cache   │                │ Fetch & Calculate
       │ technical_cache   │       ┌────────┴──────────┐
       │ layout_prefs      │       │  Engines Pipeline │
       └───────────────────┘       │  (yfinance/pandas)│
                                   └───────────────────┘
```

### Core Design Rules

- **Main Thread Rule:** The GUI Thread handles rendering and user events. Heavy I/O (network, disk writes) runs on `QThread` workers. Direct CRUD operations on the local SQLite watchlist are permitted on the main thread since they are sub-millisecond operations on the local file.
- **Signal Communication Rule:** Cross-thread communication uses only thread-safe `pyqtSignal` emissions. Workers never directly mutate UI state.
- **Stateless Computations:** Engine modules are deterministic and stateless. They accept data payloads and return structured results.

---

## 2. Multi-Threading Architecture & Task Flow

To meet **[REQ-401]** (≥60 FPS), async operations are distributed across threads.

### Thread Allocation

1. **Main Thread (GUI Loop):** Drives `QApplication`, handles widget redraws, updates graphs, processes user input, executes lightweight local SQLite CRUD.
2. **Market Polling Thread (`DataWorker` / `QThread`):** Fetches OHLCV data from yfinance for each watchlist symbol sequentially, rate-limited by `RateLimiter` (5 calls/60s window **[REQ-405]**). Retries failed requests up to 3 times with exponential backoff (1s, 2s, 3s) **[REQ-403]**.

### Polling Execution Pipeline

```
[MainWindow]          [DataWorker (QThread)]       [yfinance API]
     │                         │                         │
     │── Start Polling ───────>│                         │
     │  (per symbol)           │── RateLimiter.acquire()─>│
     │                         │                         │
     │                         │── HTTP GET ────────────>│
     │<── data_fetched(sym, df)│                         │
     │    (pyqtSignal)         │                         │
     │                         │                         │
     │── compute_all(df) ─────>│  (main thread after     │
     │── compute_consensus() ──>│   signal received)      │
     │                         │                         │
     │── repaint chart ────────│                         │
     │── update gauge ─────────│                         │
```

---

## 3. Local Relational Storage Schema (SQLite)

Zero-dependency local filesystem persistence at `data/tracker.db` **[REQ-101]**.

```
┌──────────────────────────────────┐
│           watchlist              │
├──────────────────────────────────┤
│ PK │ id         │ INTEGER        │
│    │ symbol     │ TEXT [UNIQUE]  │
│    │ alias      │ TEXT (default '')│
│    │ notes      │ TEXT (default '')│
│    │ added_at   │ TIMESTAMP      │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│         price_history            │
├──────────────────────────────────┤
│ PK │ id         │ INTEGER        │
│    │ symbol     │ TEXT           │
│    │ timestamp  │ TIMESTAMP      │
│    │ open, high, low, close, vol │
│ UK │ (symbol, timestamp)         │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│        corporate_actions         │
├──────────────────────────────────┤
│ PK │ id         │ INTEGER        │
│    │ symbol     │ TEXT           │
│    │ exchange   │ TEXT           │
│    │ headline   │ TEXT           │
│    │ body       │ TEXT           │
│    │ published_at, fetched_at    │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│         sentiment_cache          │
├──────────────────────────────────┤
│ PK │ id         │ INTEGER        │
│    │ symbol     │ TEXT [UNIQUE]  │
│    │ score      │ REAL           │
│    │ label      │ TEXT           │
│    │ cached_at  │ TIMESTAMP      │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│         technical_cache          │
├──────────────────────────────────┤
│ PK │ id         │ INTEGER        │
│ FK │ symbol     │ TEXT [UNIQUE]  │
│    │ rsi, macd_line, signal_line │
│    │ sma_20, sma_50, sma_200    │
│    │ calculated_at │ TIMESTAMP   │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│          layout_prefs            │
├──────────────────────────────────┤
│ PK │ key        │ TEXT           │
│    │ value      │ TEXT           │
└──────────────────────────────────┘
```

### Database Initialization

Tables created atomically in `config/database.py:init_db()` using WAL journal mode and foreign keys enabled.

---

## 4. Component Interface & Module Specification

### `config/database.py`

| Function | Signature | Purpose |
|---|---|---|
| `init_db()` | `() -> None` | Creates all tables, sets PRAGMAs |
| `close_db()` | `() -> None` | Closes global connection |
| `add_watchlist_symbol()` | `(symbol: str) -> bool` | Inserts symbol; returns False on duplicate |
| `list_watchlist_symbols()` | `() -> list[dict]` | Returns all watchlist rows |
| `update_watchlist_symbol()` | `(symbol, alias?, notes?) -> bool` | Updates alias/notes |
| `remove_watchlist_symbol()` | `(symbol: str) -> bool` | Deletes by symbol |
| `save_pref()` | `(key: str, value: str) -> None` | Upserts into `layout_prefs` |
| `load_pref()` | `(key: str, default='') -> str` | Reads from `layout_prefs` |

### `src/workers/data_worker.py`

Extends `QThread`. Does **not** use `QTimer` internally; process symbols sequentially in `run()`.

- **Signals:**
  - `data_fetched = pyqtSignal(str, object)` — symbol + pandas DataFrame
  - `error_occurred = pyqtSignal(str, str)` — symbol + error message
- **Constructor:** `(symbols: list[str], period="1mo", interval="1d")`
- **`run()`:** Iterates symbols, applies `RateLimiter.acquire()`, retries up to 3 times with `sleep(1*attempt)` backoff.

### `src/workers/rate_limiter.py`

Token-bucket rate limiter enforcing **[REQ-405]** (max 5 calls / 60s).

```
class RateLimiter:
    __init__(max_calls=5, period=60)
    acquire() -> None    # blocks if quota exceeded
```

### `src/engines/technical.py`

All functions accept/return `pd.Series` or `pd.DataFrame`. Stateless vectorized operations.

| Function | Signature | Returns |
|---|---|---|
| `compute_sma()` | `(data: Series, window: int) -> Series` | Rolling mean |
| `compute_rsi()` | `(data: Series, window=14) -> Series` | RSI 0–100 |
| `compute_macd()` | `(data, fast=12, slow=26, signal=9)` | `(macd, signal, histogram)` |
| `compute_all()` | `(data: Series) -> dict` | Batch: sma_20/50/200, rsi, macd |
| `compute_consensus()` | `(technical?, corporate_score?, sentiment_score?) -> dict` | Aggregated `{score, label, detail}` |

**`compute_consensus()`** normalizes 3 signal sources:
- RSI > 70 → bearish (−0.5), RSI < 30 → bullish (+0.5)
- Corporate impact score (−1.0 to +1.0)
- AI sentiment score (−1.0 to +1.0)

Thresholds: > +0.2 → BULLISH, < −0.2 → BEARISH, else NEUTRAL.

### `src/engines/sentiment.py`

| Function | Signature | Returns |
|---|---|---|
| `analyze_sentiment()` | `(text: str) -> dict` | `{score: float, label: str, source: str}` |

Uses heuristic regex matching (keyword counting). Gemini API integration is pre-wired via `os.getenv("GEMINI_API_KEY")` and `google-genai` SDK but defaults to heuristic when no key is set.

### `src/engines/corporate.py`

| Function | Signature | Returns |
|---|---|---|
| `scan_announcements()` | `(symbol: str, headlines: list[str]) -> list[dict]` | `[{symbol, headline, impact_score, scanned_at}]` |

Scores headlines via keyword classification. Positive keywords (buyback, dividend, bonus) push score toward +1.0; negative keywords (penalty, fraud, downgrade) push toward −1.0.

---

## 5. UI Component Architecture

### `src/ui/components/watchlist.py` (REQ-105, REQ-109)

`QWidget` containing:
- `QLineEdit` — search bar for entering symbols with `.NS`/`.BO` validation
- `QPushButton` — Add button
- `QTableWidget` — columns: Symbol, Price, Change %, RSI, Signal

**Signals:** `symbol_submitted(str)`, `symbol_selected(str)`

### `src/ui/components/chart.py` (REQ-106, REQ-204a, REQ-204b, REQ-205, REQ-206, REQ-207, REQ-208)

`QWidget` wrapping `pyqtgraph.GraphicsLayoutWidget`:
- **Upper plot:** Price candlesticks with SMA overlays
- **Lower plot (synced X-axis):** Volume histogram bars
- **Crosshairs:** `InfiniteLine` (vertical + horizontal) with value tooltip
- **Toolbar:** `QComboBox` for Interval (1m, 5m, 15m, 1h, 1d, 1wk) and Period (5d, 1mo, 3mo, 6mo, 1y, 2y)

### `src/ui/components/gauge.py` (REQ-107, REQ-304b, REQ-110)

`QWidget` with circular color-coded dial:
- `set_value(score, label)` — direct set
- `set_consensus(score, detail)` — auto-labels BULLISH/BEARISH/NEUTRAL based on ±0.2 thresholds

### `src/ui/screens/main_window.py` (REQ-104, REQ-110, REQ-111)

`QMainWindow` with horizontal `QSplitter`:
- Left: `Watchlist` (300px)
- Right: `Chart` + collapsible drawer (toggle via "▲/▼ Insights" button) containing `Gauge`

On startup, auto-restores watchlist from `list_watchlist_symbols()`.

### `src/ui/screens/settings_mod.py` (REQ-108, REQ-504)

`QDialog` with:
- API key input (password-masked)
- Refresh interval spin box
- Persists to `layout_prefs` table via `save_pref()`/`load_pref()`

---

## 6. Error Management & Resilience Strategy

To meet **[REQ-403]** (crash resilience) and **[REQ-407]** (worker failure isolation):

```
[Network Operation Fails]
          │
          ▼
[Increment Retry Counter]
          │
          ▼
{Has Retry Count > 3?}
      ╱              ╲
  Yes ╱                ╲ No
    ╱                    ╲
   ▼                      ▼
[Emit error_occurred]  [Sleep 1 * attempt s]
   │                      │
   ▼                      ▼
[UI stays interactive] [Re-Execute HTTP Request]
   │
   ▼
[No crash; main loop continues]
```

### Rate Limiting

`RateLimiter` enforces 5 outbound calls per 60-second sliding window **[REQ-405]**. Excess calls block the worker thread (non GUI-blocking since worker is a `QThread`).

---

## 7. Settings Persistence

User settings (Gemini API key, refresh interval) are persisted to the `layout_prefs` SQLite table via `save_pref()`/`load_pref()` and restored on next launch **[REQ-504]**.

---

## 8. Brand Theme

PRD-specified palette enforced in `config/settings.py` and `src/ui/styles.qss` **[REQ-503]**:

| Token | Hex |
|---|---|
| Background | `#0A192F` (Deep Navy) |
| Secondary BG | `#112240` |
| Bullish | `#10B981` (Emerald Green) |
| Bearish | `#EF4444` (Crimson Red) |
| Neutral | `#F59E0B` (Amber) |
| Text Primary | `#CCD6F6` |
| Text Secondary | `#8892B0` |

---

## 9. Build & Deployment

`build_installer.py` uses `PyInstaller --onefile --windowed` to bundle the application into a single executable **[REQ-502]**.
