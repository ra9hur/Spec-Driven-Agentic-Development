import re
from datetime import datetime, timezone

EXCHANGE_SOURCES = ["NSE", "BSE"]


def scan_announcements(symbol: str, headlines: list[str]) -> list[dict]:
    results = []
    for headline in headlines:
        score = _classify_impact(headline)
        results.append({
            "symbol": symbol,
            "headline": headline,
            "impact_score": score,
            "scanned_at": datetime.now(timezone.utc).isoformat(),
        })
    return results


def _classify_impact(headline: str) -> float:
    headline_lower = headline.lower()

    positive = r"\b(buyback|dividend|bonus|stock split|positive|upgrade|profit|growth|expansion)\b"
    negative = r"\b(downgrade|loss|fraud|investigation|penalty|default|layoff|restructuring)\b"

    pos_count = len(re.findall(positive, headline_lower))
    neg_count = len(re.findall(negative, headline_lower))

    net = pos_count - neg_count
    if net > 0:
        return min(1.0, net * 0.25)
    if net < 0:
        return max(-1.0, net * 0.25)
    return 0.0
