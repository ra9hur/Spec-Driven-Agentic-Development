import re
from datetime import datetime, timezone

import pytest
import pandas as pd
import numpy as np
from src.engines.technical import compute_rsi, compute_sma, compute_macd, compute_consensus
from src.engines.sentiment import analyze_sentiment, _heuristic_polarity, _to_label, GEMINI_API_KEY
from src.engines.corporate import scan_announcements, _classify_impact, EXCHANGE_SOURCES


class TestREQ301a:
    def test_sma_values(self):
        data = pd.Series([1, 2, 3, 4, 5])
        sma = compute_sma(data, 3)
        assert pd.isna(sma.iloc[0])
        assert pd.isna(sma.iloc[1])
        assert sma.iloc[2] == pytest.approx(2.0)

    def test_sma_multiple_windows(self):
        data = pd.Series(np.random.randn(100) + 100)
        assert len(compute_sma(data, 20)) == 100
        assert len(compute_sma(data, 50)) == 100
        assert len(compute_sma(data, 200)) == 100

    def test_sma_window_equals_one(self):
        data = pd.Series([10, 20, 30])
        sma = compute_sma(data, 1)
        assert sma.iloc[0] == 10.0
        assert sma.iloc[1] == 20.0
        assert sma.iloc[2] == 30.0
        assert len(sma) == 3

    def test_sma_window_larger_than_data(self):
        data = pd.Series([1, 2, 3])
        sma = compute_sma(data, 10)
        assert len(sma) == 3
        assert pd.isna(sma.iloc[0])
        assert pd.isna(sma.iloc[1])
        assert pd.isna(sma.iloc[2])

    def test_sma_window_exactly_data_length(self):
        data = pd.Series([1, 2, 3])
        sma = compute_sma(data, 3)
        assert pd.isna(sma.iloc[0])
        assert pd.isna(sma.iloc[1])
        assert sma.iloc[2] == pytest.approx(2.0)

    def test_sma_empty_series(self):
        data = pd.Series([], dtype=float)
        sma = compute_sma(data, 3)
        assert len(sma) == 0

    def test_sma_index_preserved(self):
        idx = pd.DatetimeIndex(["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04", "2024-01-05"])
        data = pd.Series([1, 2, 3, 4, 5], index=idx)
        sma = compute_sma(data, 3)
        assert list(sma.index) == list(idx)


class TestREQ301b:
    def test_rsi_returns_series(self):
        data = pd.Series(np.random.randn(100) + 100)
        rsi = compute_rsi(data)
        assert len(rsi) == 100
        assert rsi.min() >= 0 and rsi.max() <= 100

    def test_rsi_constant_data(self):
        data = pd.Series([100.0] * 50)
        rsi = compute_rsi(data)
        assert rsi.iloc[-1] == 50.0 or pd.isna(rsi.iloc[-1])

    def test_rsi_monotonic_uptrend(self):
        data = pd.Series(np.arange(100, 200, dtype=float))
        rsi = compute_rsi(data, 14)
        assert len(rsi) == 100
        # Zero-loss (monotonic uptrend) produces NaN per DDP zero-division guard
        assert pd.isna(rsi).all() or (rsi.min() >= 0 and rsi.max() <= 100)

    def test_rsi_monotonic_downtrend(self):
        data = pd.Series(np.arange(200, 100, -1, dtype=float))
        rsi = compute_rsi(data, 14)
        assert len(rsi) == 100
        assert rsi.min() >= 0 and rsi.max() <= 100

    def test_rsi_custom_window(self):
        data = pd.Series(np.random.randn(100) + 100)
        rsi = compute_rsi(data, window=7)
        assert len(rsi) == 100
        assert rsi.min() >= 0 and rsi.max() <= 100

    def test_rsi_empty_series(self):
        data = pd.Series([], dtype=float)
        rsi = compute_rsi(data, 14)
        assert len(rsi) == 0

    def test_rsi_index_preserved(self):
        idx = pd.date_range("2024-01-01", periods=50, freq="D")
        data = pd.Series(np.random.randn(50) + 100, index=idx)
        rsi = compute_rsi(data, 14)
        assert list(rsi.index) == list(idx)

    def test_rsi_all_nan_input(self):
        data = pd.Series([np.nan] * 50)
        rsi = compute_rsi(data, 14)
        assert len(rsi) == 50
        assert pd.isna(rsi).all()


class TestREQ301c:
    def test_macd_output_shapes(self):
        data = pd.Series(np.random.randn(100) + 100)
        macd, signal, hist = compute_macd(data)
        assert len(macd) == 100
        assert len(signal) == 100
        assert len(hist) == 100

    def test_macd_components(self):
        data = pd.Series(np.random.randn(100) + 100)
        macd, signal, hist = compute_macd(data)
        assert not pd.isna(macd.iloc[-1])

    def test_macd_custom_parameters(self):
        data = pd.Series(np.random.randn(100) + 100)
        macd, signal, hist = compute_macd(data, fast=8, slow=20, signal=5)
        assert len(macd) == len(signal) == len(hist) == 100
        assert not pd.isna(macd.iloc[-1])

    def test_macd_constant_data(self):
        data = pd.Series([100.0] * 100)
        macd, signal, hist = compute_macd(data)
        assert len(macd) == len(signal) == len(hist) == 100
        assert macd.iloc[-1] == pytest.approx(0.0, abs=1e-10)
        assert signal.iloc[-1] == pytest.approx(0.0, abs=1e-10)
        assert hist.iloc[-1] == pytest.approx(0.0, abs=1e-10)

    def test_macd_empty_series(self):
        data = pd.Series([], dtype=float)
        macd, signal, hist = compute_macd(data)
        assert len(macd) == len(signal) == len(hist) == 0

    def test_macd_index_preserved(self):
        idx = pd.date_range("2024-01-01", periods=100, freq="D")
        data = pd.Series(np.random.randn(100) + 100, index=idx)
        macd, signal, hist = compute_macd(data)
        assert list(macd.index) == list(idx)
        assert list(signal.index) == list(idx)
        assert list(hist.index) == list(idx)

    def test_macd_fast_gt_slow_swapped_params(self):
        data = pd.Series(np.random.randn(100) + 100)
        macd, signal, hist = compute_macd(data, fast=26, slow=12, signal=9)
        assert len(macd) == 100
        assert not pd.isna(macd.iloc[-1])

    def test_macd_all_nan_input(self):
        data = pd.Series([np.nan] * 100)
        macd, signal, hist = compute_macd(data)
        assert len(macd) == len(signal) == len(hist) == 100
        assert pd.isna(macd).all()
        assert pd.isna(signal).all()
        assert pd.isna(hist).all()


class TestREQ302:
    def test_sma_values_moved(self):
        data = pd.Series([1, 2, 3, 4, 5])
        sma = compute_sma(data, 3)
        assert sma.iloc[2] == pytest.approx(2.0)

    def test_classify_impact_single_positive(self):
        assert _classify_impact("Company announces bonus issue") == 0.25

    def test_classify_impact_single_negative(self):
        assert _classify_impact("SEBI penalty imposed") == -0.25

    def test_classify_impact_multiple_positive(self):
        assert _classify_impact("bonus dividend growth profit") == 1.0

    def test_classify_impact_multiple_negative(self):
        assert _classify_impact("fraud loss penalty default") == -1.0

    def test_classify_impact_clamped_at_one(self):
        assert _classify_impact("bonus dividend buyback stock split positive upgrade profit") == 1.0

    def test_classify_impact_clamped_at_negative_one(self):
        assert _classify_impact("fraud loss penalty default downgrade investigation") == -1.0

    def test_classify_impact_mixed_keywords_net_zero(self):
        assert _classify_impact("bonus penalty") == 0.0

    def test_classify_impact_mixed_keywords_net_positive(self):
        assert _classify_impact("bonus fraud profit") == 0.25

    def test_classify_impact_mixed_keywords_net_negative(self):
        assert _classify_impact("fraud bonus penalty") == -0.25

    def test_classify_impact_case_insensitive(self):
        assert _classify_impact("BONUS ISSUE") == 0.25
        assert _classify_impact("Penalty Imposed") == -0.25

    def test_classify_impact_punctuation_around_keywords(self):
        assert _classify_impact("bonus!") == 0.25
        assert _classify_impact("(penalty)") == -0.25

    def test_classify_impact_no_keywords(self):
        assert _classify_impact("Company makes regular announcement") == 0.0

    def test_classify_impact_empty_string(self):
        assert _classify_impact("") == 0.0

    def test_classify_impact_substring_safety(self):
        assert _classify_impact("downgrading the rating") == 0.0
        assert _classify_impact("antigrowth measure") == 0.0
        assert _classify_impact("falsepositive result") == 0.0

    def test_classify_impact_duplicate_keywords_counted(self):
        assert _classify_impact("bonus bonus bonus") == 0.75

    def test_exchange_sources_defined(self):
        assert EXCHANGE_SOURCES == ["NSE", "BSE"]

    def test_scan_announcements_returns_list(self):
        results = scan_announcements("TEST.NS", ["bonus issue", "penalty imposed"])
        assert len(results) == 2

    def test_scan_announcements_result_keys(self):
        results = scan_announcements("TEST.NS", ["bonus issue"])
        r = results[0]
        assert "symbol" in r
        assert "headline" in r
        assert "impact_score" in r
        assert "scanned_at" in r

    def test_scan_announcements_symbol_and_headline_preserved(self):
        results = scan_announcements("TEST.NS", ["bonus issue"])
        r = results[0]
        assert r["symbol"] == "TEST.NS"
        assert r["headline"] == "bonus issue"

    def test_scan_announcements_timestamp_iso8601_utc(self):
        results = scan_announcements("TEST.NS", ["bonus issue"])
        ts = results[0]["scanned_at"]
        parsed = datetime.fromisoformat(ts)
        assert parsed.tzinfo is not None
        assert parsed.tzinfo.utcoffset(parsed) == timezone.utc.utcoffset(parsed)

    def test_scan_announcements_empty_headlines(self):
        results = scan_announcements("TEST.NS", [])
        assert results == []

    def test_scan_announcements_multiple_headlines_all_positive(self):
        results = scan_announcements("TEST.NS", ["bonus issue", "dividend declared", "profit growth"])
        assert len(results) == 3
        for r in results:
            assert r["impact_score"] > 0

    def test_scan_announcements_mixed_scores(self):
        results = scan_announcements("TEST.NS", ["bonus issue", "fraud investigation"])
        assert results[0]["impact_score"] > 0
        assert results[1]["impact_score"] < 0


class TestREQ303:
    def test_sentiment_bullish(self):
        result = analyze_sentiment("strong growth expected")
        assert result["label"] == "bullish"

    def test_sentiment_bearish(self):
        result = analyze_sentiment("weak decline crash")
        assert result["label"] == "bearish"

    def test_sentiment_neutral(self):
        result = analyze_sentiment("the stock market is open today")
        assert result["label"] == "neutral"

    def test_heuristic_polarity_all_positive(self):
        assert _heuristic_polarity("bullish upward rally") == pytest.approx(1.0)

    def test_heuristic_polarity_all_negative(self):
        assert _heuristic_polarity("bearish downward crash") == pytest.approx(-1.0)

    def test_heuristic_polarity_equal_pos_neg(self):
        assert _heuristic_polarity("bullish bearish") == 0.0

    def test_heuristic_polarity_mixed_net_positive(self):
        assert _heuristic_polarity("bullish strong bearish") == pytest.approx(1.0 / 3.0)

    def test_heuristic_polarity_mixed_net_negative(self):
        assert _heuristic_polarity("bearish weak bullish") == pytest.approx(-1.0 / 3.0)

    def test_heuristic_polarity_no_keywords(self):
        assert _heuristic_polarity("the stock market is open today") == 0.0

    def test_heuristic_polarity_empty_string(self):
        assert _heuristic_polarity("") == 0.0

    def test_heuristic_polarity_case_insensitive(self):
        assert _heuristic_polarity("BULLISH GROWTH") == pytest.approx(1.0)
        assert _heuristic_polarity("Bearish Weak") == pytest.approx(-1.0)

    def test_heuristic_polarity_punctuation(self):
        assert _heuristic_polarity("strong!") > 0
        assert _heuristic_polarity("(weak)") < 0

    def test_heuristic_polarity_substring_safety(self):
        assert _heuristic_polarity("upwardly") == 0.0

    def test_to_label_positive_above_threshold(self):
        assert _to_label(0.3) == "bullish"

    def test_to_label_positive_at_threshold(self):
        assert _to_label(0.2) == "neutral"

    def test_to_label_positive_below_threshold(self):
        assert _to_label(0.1) == "neutral"

    def test_to_label_negative_below_threshold(self):
        assert _to_label(-0.3) == "bearish"

    def test_to_label_negative_at_threshold(self):
        assert _to_label(-0.2) == "neutral"

    def test_to_label_negative_above_threshold(self):
        assert _to_label(-0.1) == "neutral"

    def test_to_label_exactly_zero(self):
        assert _to_label(0.0) == "neutral"

    def test_sentiment_source_is_heuristic(self):
        result = analyze_sentiment("strong growth expected")
        assert result["source"] == "heuristic"

    def test_sentiment_returns_score(self):
        result = analyze_sentiment("strong growth expected")
        assert "score" in result

    def test_sentiment_score_correct(self):
        result = analyze_sentiment("strong growth expected")
        assert result["score"] == pytest.approx(1.0)

    def test_gemini_api_key_defined(self):
        assert GEMINI_API_KEY is None or isinstance(GEMINI_API_KEY, str)


class TestREQ304a:
    def test_consensus_with_all_signals(self):
        rsi_series = pd.Series([25.0] * 10)
        technical = {"rsi": rsi_series}
        result = compute_consensus(
            technical=technical, corporate_score=0.5, sentiment_score=0.3
        )
        assert "score" in result
        assert "label" in result
        assert result["label"] in ("BULLISH", "BEARISH", "NEUTRAL")

    def test_consensus_no_signals(self):
        result = compute_consensus()
        assert result["score"] == 0.0
        assert result["label"] == "NEUTRAL"

    def test_consensus_rsi_oversold_adds_half(self):
        rsi = pd.Series([25.0])
        result = compute_consensus(technical={"rsi": rsi})
        assert result["score"] == 0.5

    def test_consensus_rsi_overbought_subtracts_half(self):
        rsi = pd.Series([75.0])
        result = compute_consensus(technical={"rsi": rsi})
        assert result["score"] == -0.5

    def test_consensus_rsi_neutral_returns_zero(self):
        rsi = pd.Series([50.0])
        result = compute_consensus(technical={"rsi": rsi})
        assert result["score"] == 0.0

    def test_consensus_rsi_exactly_30_is_neutral(self):
        rsi = pd.Series([30.0])
        result = compute_consensus(technical={"rsi": rsi})
        assert result["score"] == 0.0

    def test_consensus_rsi_exactly_70_is_neutral(self):
        rsi = pd.Series([70.0])
        result = compute_consensus(technical={"rsi": rsi})
        assert result["score"] == 0.0

    def test_consensus_rsi_nan_skipped(self):
        rsi = pd.Series([np.nan])
        result = compute_consensus(technical={"rsi": rsi})
        assert result["score"] == 0.0
        assert result["label"] == "NEUTRAL"

    def test_consensus_only_corporate(self):
        result = compute_consensus(corporate_score=0.8)
        assert result["score"] == 0.8
        assert result["label"] == "BULLISH"

    def test_consensus_only_sentiment(self):
        result = compute_consensus(sentiment_score=-0.5)
        assert result["score"] == -0.5
        assert result["label"] == "BEARISH"

    def test_consensus_only_technical_rsi(self):
        rsi = pd.Series([25.0])
        result = compute_consensus(technical={"rsi": rsi})
        assert result["score"] == 0.5
        assert result["label"] == "BULLISH"

    def test_consensus_all_three_signals_compute_average(self):
        rsi = pd.Series([25.0])
        result = compute_consensus(
            technical={"rsi": rsi},
            corporate_score=0.5,
            sentiment_score=0.3,
        )
        expected = round((0.5 + 0.5 + 0.3) / 3, 4)
        assert result["score"] == expected

    def test_consensus_score_rounded_four_decimals(self):
        rsi = pd.Series([25.0])
        result = compute_consensus(
            technical={"rsi": rsi},
            corporate_score=0.33333,
        )
        assert result["score"] == round((0.5 + 0.33333) / 2, 4)

    def test_consensus_label_bullish_above_threshold(self):
        result = compute_consensus(corporate_score=0.3)
        assert result["label"] == "BULLISH"

    def test_consensus_label_bearish_below_threshold(self):
        result = compute_consensus(corporate_score=-0.3)
        assert result["label"] == "BEARISH"

    def test_consensus_label_neutral_at_zero(self):
        result = compute_consensus(corporate_score=0.0)
        assert result["label"] == "NEUTRAL"

    def test_consensus_detail_no_signals(self):
        result = compute_consensus()
        assert result["detail"] == "No signals available"

    def test_consensus_detail_with_signals(self):
        result = compute_consensus(corporate_score=0.5)
        assert "Aggregated from" in result["detail"]
        assert "signal(s)" in result["detail"]


class TestREQ304b:
    def test_scan_announcements_positive(self):
        results = scan_announcements("TEST.NS", ["Company announces bonus issue"])
        assert results[0]["impact_score"] > 0

    def test_scan_announcements_negative(self):
        results = scan_announcements("TEST.NS", ["SEBI penalty imposed"])
        assert results[0]["impact_score"] < 0

    def test_scan_announcements_exact_score_positive(self):
        results = scan_announcements("TEST.NS", ["bonus issue"])
        assert results[0]["impact_score"] == 0.25

    def test_scan_announcements_exact_score_negative(self):
        results = scan_announcements("TEST.NS", ["fraud investigation"])
        assert results[0]["impact_score"] == -0.5

    def test_scan_announcements_all_keywords_covered(self):
        pos_headlines = [
            "buyback announced", "dividend declared", "bonus issue",
            "stock split approved", "positive outlook", "upgrade by analyst",
            "profit increased", "strong growth", "expansion plans",
        ]
        for h in pos_headlines:
            assert _classify_impact(h) > 0, f"Expected positive for: {h}"

    def test_scan_announcements_all_negative_keywords_covered(self):
        neg_headlines = [
            "downgrade by rating agency", "loss incurred",
            "fraud detected", "investigation launched",
            "penalty imposed", "default on payment",
            "layoff announced", "restructuring plan",
        ]
        for h in neg_headlines:
            assert _classify_impact(h) < 0, f"Expected negative for: {h}"

    def test_scan_announcements_stock_split_phrase_matches(self):
        assert _classify_impact("stock split approved") == 0.25

    def test_scan_announcements_word_boundaries_respected(self):
        assert _classify_impact("antigrowth") == 0.0
        assert _classify_impact("falsepositive") == 0.0
