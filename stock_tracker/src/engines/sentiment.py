import os
import re

GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")


def analyze_sentiment(text: str) -> dict:
    polarity = _heuristic_polarity(text)
    return {
        "score": polarity,
        "label": _to_label(polarity),
        "source": "heuristic",
    }


def _heuristic_polarity(text: str) -> float:
    positive = r"\b(bullish|upward|rally|outperform|beat|growth|strong|positive)\b"
    negative = r"\b(bearish|downward|crash|underperform|miss|decline|weak|negative)\b"

    text_lower = text.lower()
    pos_count = len(re.findall(positive, text_lower))
    neg_count = len(re.findall(negative, text_lower))

    total = pos_count + neg_count
    if total == 0:
        return 0.0
    return (pos_count - neg_count) / total


def _to_label(score: float) -> str:
    if score > 0.2:
        return "bullish"
    if score < -0.2:
        return "bearish"
    return "neutral"
