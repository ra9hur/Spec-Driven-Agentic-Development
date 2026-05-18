# StockTracker Pro — User Guide

## Getting Started

### Installation

Ensure dependencies are installed (using conda or pip):

```bash
conda activate stock-tracker
# or
pip install -r requirements.txt
```

### Launching the Application

```bash
python main.py
```

On startup, the database is initialised automatically (`data/tracker.db`). The SEBI disclaimer is printed to the terminal.

---

## Main Window Layout

```
+-------------------+------------------------------------------+
|   WATCHLIST       |          PRICE CHART                      |
|                   |                                          |
| [Search Input   ] |  [Interval: v] [Period: v]              |
| [Add] [Delete]   |  +------------------------------------+ |
|                   |  |  o  Candlestick / Line Chart      | |
| Symbol   Price .. |  |  |                                | |
| AAPL.NS  150.00   |  |  |                                | |
|                    |  +------------------------------------+ |
|                    |  +------------------------------------+ |
|                    |  |  Volume Bars                       | |
|                    |  +------------------------------------+ |
|                    |                                          |
|                    |  ▼ Insights                              |
|                    |  [ Gauge / Consensus Indicator ]         |
+-------------------+------------------------------------------+
```

### Watchlist Panel (Left)

- **Adding a symbol**: Type a symbol in the format `SYMBOL.NS` (NSE) or `SYMBOL.BO` (BSE) and press Enter or click **Add**.
  - Valid examples: `RELIANCE.NS`, `TCS.BO`, `INFY.NS`
  - Invalid: `RELIANCE` (missing exchange suffix), `123.NS` (must start with letters)
- **Viewing a symbol**: Double-click any row in the table. The chart and gauge update.
- **Deleting a symbol**: Select a row and press the **Delete** key or click the **Delete** button. The symbol is removed from the watchlist and database.

### Chart Panel (Centre)

Displays historical price data as candlesticks (OHLC) with a volume histogram below.

- **Interval selector**: Choose `1m`, `5m`, `15m`, `1h`, `1d`, `1wk`
- **Period selector**: Choose `5d`, `1mo`, `3mo`, `6mo`, `1y`, `2y`
- **Crosshair**: Move the mouse over the chart to see a crosshair with x/y coordinates.
- **Y-axis**: Prices are shown as integers with comma separators (e.g. `1,339`).

### Insights Drawer (Bottom-Right)

Click **▼ Insights** to toggle the gauge panel, which shows the consensus trading signal (e.g. Strong Buy, Hold, Strong Sell) based on technical indicators.

---

## Data Sources & Fallback

### Primary: Yahoo Finance (`yfinance`)

The application attempts to fetch historical OHLCV data from Yahoo Finance. Up to 3 retries are attempted with exponential backoff (1s, 2s delays).

### Fallback: Google Finance

If Yahoo Finance is unreachable or returns empty data, the application seamlessly falls back to Google Finance, displaying the current live price as a dashed horizontal line with a price label.

When the fallback is active, the status bar shows:

> Connection Alert: Yahoo Finance feed timed out. Seamlessly routed tracking loop through backup Google Finance pipeline (15-min delay applies).

During data loading, the status bar shows:

> Fetching SYMBOL... please wait

---

## Status Bar Messages

| Condition | Message |
|-----------|---------|
| Fetch started | `Fetching SYMBOL... please wait` |
| Fallback active | `Connection Alert: ... 15-min delay applies` |
| Yahoo Finance working | *(no additional message — chart renders normally)* |
| Fetch failed entirely | `Failed to load SYMBOL: <error>` |
| Invalid symbol format | `Invalid format. Use SYMBOL.NS or SYMBOL.BO (e.g. RELIANCE.NS)` |
| Duplicate symbol | `SYMBOL is already in the watchlist` |

---

## Settings

Press the Settings button (if available in the toolbar) to open the settings modal:

- **Refresh Interval (seconds)**: How often the app polls for new data. Default: `60`. Range: `5`–`300`.
- **API Key**: Optional key for external data APIs (not currently used by the built-in data sources).

All settings persist across app restarts via the SQLite database (`layout_prefs` table).

---

## Building a Standalone Executable

To package the application into a single executable:

```bash
python build_installer.py
```

This uses PyInstaller with `--onefile` and `--windowed` flags. The resulting binary will be in the `dist/` directory. The stylesheet (`src/ui/styles.qss`) and icon (`assets/icon.ico`) are bundled automatically.

---

## Brand Colours

| Token | Hex | Usage |
|-------|-----|-------|
| Bullish candle | `#10B981` | Green candle body / line |
| Bearish candle | `#EF4444` | Red candle body / line |
| Background primary | `#0A192F` | Chart background |
| Background secondary | `#112240` | Alternate backgrounds |
| Text primary | `#CCD6F6` | Labels, crosshair, headers |
| Header / button bg | `#233554` | Toolbar backgrounds |
| Neutral | `#64FFDA` | Line plots, indicators |

---

## Database

The application uses a local SQLite database at `data/tracker.db` with the following tables:

- `watchlist` — Saved symbols with metadata
- `price_history` — Cached OHLCV data
- `corporate_actions` — News and events
- `sentiment_cache` — Cached sentiment scores
- `technical_cache` — Cached RSI, MACD, SMA values
- `layout_prefs` — Settings key-value pairs

---

## Troubleshooting

| Symptom | Likely Cause | Remedy |
|---------|-------------|--------|
| Chart is blank / "Failed to load" | Yahoo Finance API blocked / rate-limited | The Google Finance fallback activates automatically; wait a few seconds. |
| "SYMBOL is possibly delisted" | Yahoo Finance has no data for this ticker | Verify the symbol exists on Yahoo Finance. Try a different exchange suffix. |
| No price data for Indian stocks | Network / DNS issue with Yahoo Finance | The fallback will use Google Finance. Ensure internet connectivity. |
| Watchlist not saving | Database file permissions | Check that `data/` directory is writable. |
| App freezes on startup | Corrupted database | Delete `data/tracker.db` and restart (all watchlist data will be lost). |
