# StockTracker Pro

Real-time stock tracking desktop application for Indian (NSE/BSE) and US markets with OHLC candlestick charts, volume analysis, and sentiment consensus indicators.

## Features

- **Watchlist management** — Add/delete symbols for NSE (`.NS`) and BSE (`.BO`) exchanges
- **Candlestick charts** — Interactive OHLC price chart with volume histogram
- **Data source fallback** — Primary: Yahoo Finance (`yfinance`); automatic fallback: Google Finance (BeautifulSoup/requests)
- **Consensus gauge** — Technical indicator aggregation (RSI, MACD, SMA) with Buy/Hold/Sell signal
- **Crosshair** — Mouse-over price/volume inspection
- **Settings persistence** — Configurable refresh interval and API key saved to local SQLite
- **SEBI disclaimer** — Printed on startup for Indian market compliance
- **Standalone binary** — PyInstaller-based build for distribution

## Quick Start

### Prerequisites

- Python 3.12+
- [conda](https://docs.conda.io/) (recommended) or pip

### Installation

```bash
# Using conda (recommended)
conda env create -f environment.yml
conda activate stock-tracker

# Or using pip
pip install -r requirements.txt
```

### Run

```bash
python main.py
```

## Usage

| Action | How |
|--------|-----|
| Add a symbol | Type `SYMBOL.NS` or `SYMBOL.BO` and press Enter / click **Add** |
| View chart | Double-click a symbol in the watchlist |
| Delete a symbol | Select a row and press **Delete** or click **Delete** |
| Change interval/period | Use the dropdowns above the chart |
| Toggle insights drawer | Click **▼ Insights** |
| Settings | Configure refresh interval and API key in the Settings modal |

When Yahoo Finance is unreachable, the app seamlessly falls back to Google Finance and shows a status bar alert. During data loading the status bar reads `Fetching SYMBOL... please wait`.

## Building a Standalone Binary

```bash
pip install pyinstaller
python build_installer.py
```

The executable is produced at `dist/StockTrackerPro`. No Python or dependency installation is needed on the target machine.

## Project Structure

```
├── main.py                 # Application entrypoint
├── build_installer.py      # PyInstaller build script
├── config/
│   ├── database.py         # SQLite connection, CRUD helpers
│   └── settings.py         # Brand colours, constants, disclaimer
├── src/
│   ├── ui/
│   │   ├── screens/
│   │   │   └── main_window.py   # Main window layout & signal wiring
│   │   ├── components/
│   │   │   ├── chart.py         # pyqtgraph candlestick/volume chart
│   │   │   ├── gauge.py         # Consensus signal gauge
│   │   │   └── watchlist.py     # Watchlist table, add/delete UI
│   │   └── styles.qss           # Dark-theme stylesheet
│   └── workers/
│       ├── data_worker.py       # QThread-based data fetcher with retry
│       ├── google_finance.py    # Google Finance HTML parser fallback
│       └── rate_limiter.py      # API-call rate limiter
├── tests/                  # 460+ pytest test cases
├── docs/                   # PRD, design plans, user guide
└── data/                   # SQLite database (auto-created)
```

## Tech Stack

- **Language**: Python 3.12
- **GUI**: PyQt6
- **Charting**: pyqtgraph
- **Data**: yfinance, pandas, requests, BeautifulSoup
- **Storage**: SQLite
- **Packaging**: PyInstaller
- **Testing**: pytest, pytest-qt, pytest-mock

## Disclaimer

This application is for **educational purposes only**. It is not financial advice. The SEBI disclaimer is printed at startup. Stock market investments carry risk — consult a qualified financial advisor before making investment decisions.
