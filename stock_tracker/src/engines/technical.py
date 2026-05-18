import numpy as np
import pandas as pd

from config.settings import CONSENSUS_BULLISH_THRESHOLD, CONSENSUS_BEARISH_THRESHOLD


def compute_sma(data: pd.Series, window: int) -> pd.Series:
    return data.rolling(window=window).mean()


def compute_rsi(data: pd.Series, window: int = 14) -> pd.Series:
    delta = data.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(alpha=1 / window, min_periods=window).mean()
    avg_loss = loss.ewm(alpha=1 / window, min_periods=window).mean()
    rs = avg_gain / avg_loss.replace(0, np.nan)
    return 100 - (100 / (1 + rs))


def compute_macd(
    data: pd.Series,
    fast: int = 12,
    slow: int = 26,
    signal: int = 9,
) -> tuple[pd.Series, pd.Series, pd.Series]:
    ema_fast = data.ewm(span=fast).mean()
    ema_slow = data.ewm(span=slow).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal).mean()
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram


def compute_all(
    data: pd.Series,
) -> dict:
    return {
        "sma_20": compute_sma(data, 20),
        "sma_50": compute_sma(data, 50),
        "sma_200": compute_sma(data, 200),
        "rsi": compute_rsi(data, 14),
        "macd_line": compute_macd(data)[0],
        "signal_line": compute_macd(data)[1],
        "macd_histogram": compute_macd(data)[2],
    }


def compute_consensus(
    technical: dict | None = None,
    corporate_score: float | None = None,
    sentiment_score: float | None = None,
) -> dict:
    scores = []
    if technical is not None:
        rsi = technical.get("rsi")
        if rsi is not None:
            latest_rsi = rsi.iloc[-1] if hasattr(rsi, "iloc") else rsi
            if pd.isna(latest_rsi):
                pass
            elif latest_rsi > 70:
                scores.append(-0.5)
            elif latest_rsi < 30:
                scores.append(0.5)
            else:
                scores.append(0.0)

    if corporate_score is not None:
        scores.append(corporate_score)

    if sentiment_score is not None:
        scores.append(sentiment_score)

    if not scores:
        return {"score": 0.0, "label": "NEUTRAL", "detail": "No signals available"}

    avg = sum(scores) / len(scores)
    if avg > CONSENSUS_BULLISH_THRESHOLD:
        label = "BULLISH"
    elif avg < CONSENSUS_BEARISH_THRESHOLD:
        label = "BEARISH"
    else:
        label = "NEUTRAL"

    return {
        "score": round(avg, 4),
        "label": label,
        "detail": f"Aggregated from {len(scores)} signal(s)",
    }
