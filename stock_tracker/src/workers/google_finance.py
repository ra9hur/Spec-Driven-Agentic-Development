import re
from datetime import datetime, timezone

import pandas as pd
import requests
from bs4 import BeautifulSoup

from src.workers.rate_limiter import RateLimiter

_EXCHANGE_MAP: dict[str, str] = {
    ".NS": "NSE",
    ".BO": "BOM",
}

_RATE_LIMITER = RateLimiter()


def _to_exchange_code(symbol: str) -> tuple[str, str]:
    for suffix, exchange in _EXCHANGE_MAP.items():
        if symbol.upper().endswith(suffix):
            ticker = symbol[: -len(suffix)]
            return ticker.upper(), exchange
    return symbol.upper(), "NASDAQ"


def fetch_stock_data(symbol: str, period: str | None = None) -> pd.DataFrame | None:
    _RATE_LIMITER.acquire()
    ticker, exchange = _to_exchange_code(symbol)
    url = f"https://www.google.com/finance/quote/{ticker}:{exchange}"
    try:
        resp = requests.get(
            url,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (X11; Linux x86_64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36"
                )
            },
            timeout=15,
        )
        if resp.status_code != 200:
            return None
        soup = BeautifulSoup(resp.text, "html.parser")
        price_div = soup.find("div", class_="WqI4rf")
        if price_div is None:
            return None
        text = price_div.text
        m = re.search(r"[₹$]?([0-9,]+\.?[0-9]*)", text)
        if m is None:
            return None
        price = float(m.group(1).replace(",", ""))
        now = datetime.now(timezone.utc)
        data = {
            "Open": [price],
            "High": [price],
            "Low": [price],
            "Close": [price],
            "Volume": [0],
        }
        return pd.DataFrame(data, index=pd.DatetimeIndex([now]))
    except requests.RequestException:
        return None
