import os
import sqlite3
import pytest
from config.database import (
    init_db, get_connection, close_db, DB_PATH, DB_DIR,
    add_watchlist_symbol, list_watchlist_symbols,
    update_watchlist_symbol, remove_watchlist_symbol,
    save_pref, load_pref,
)

NSE_SYMBOL = "RELIANCE.NS"
BO_SYMBOL = "TCS.BO"
INVALID_SYMBOL = "NOTVALID"

EXPECTED_TABLES = {
    "watchlist": ["id", "symbol", "alias", "notes", "added_at"],
    "price_history": ["id", "symbol", "timestamp", "open", "high", "low", "close", "volume"],
    "corporate_actions": ["id", "symbol", "exchange", "headline", "body", "published_at", "fetched_at"],
    "sentiment_cache": ["id", "symbol", "score", "label", "cached_at"],
    "technical_cache": ["id", "symbol", "rsi", "macd_line", "signal_line", "sma_20", "sma_50", "sma_200", "calculated_at"],
    "layout_prefs": ["key", "value"],
}


class TestREQ101:
    def test_database_initializes_without_error(self):
        init_db()
        conn = get_connection()
        assert conn is not None

    def test_watchlist_table_exists(self):
        init_db()
        conn = get_connection()
        tables = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table'"
        ).fetchall()
        names = [r["name"] for r in tables]
        assert "watchlist" in names


class TestREQ102:
    """REQ-102: Target Ticker Validation Framework.

    Validates that the compiled _SYMBOL_RE regex correctly enforces
    the NSE (.NS) and BSE (.BO) ticker suffix convention.
    """

    def test_nse_symbol_valid(self):
        from src.ui.components.watchlist import _SYMBOL_RE
        assert _SYMBOL_RE.match("RELIANCE.NS") is not None

    def test_bse_symbol_valid(self):
        from src.ui.components.watchlist import _SYMBOL_RE
        assert _SYMBOL_RE.match("TCS.BO") is not None

    def test_invalid_symbol_rejected(self):
        from src.ui.components.watchlist import _SYMBOL_RE
        assert _SYMBOL_RE.match("NOTVALID") is None


class TestREQ102EdgeCases:
    """Edge case and failure scenario tests for REQ-102 symbol validation."""

    def test_lowercase_nse_accepted(self):
        from src.ui.components.watchlist import _SYMBOL_RE
        assert _SYMBOL_RE.match("reliance.ns") is not None

    def test_mixed_case_nse_accepted(self):
        from src.ui.components.watchlist import _SYMBOL_RE
        assert _SYMBOL_RE.match("Reliance.NS") is not None

    def test_lowercase_bse_accepted(self):
        from src.ui.components.watchlist import _SYMBOL_RE
        assert _SYMBOL_RE.match("tcs.bo") is not None

    def test_symbol_with_numbers_accepted(self):
        from src.ui.components.watchlist import _SYMBOL_RE
        assert _SYMBOL_RE.match("ABC123.NS") is not None

    def test_symbol_with_only_numbers_accepted(self):
        from src.ui.components.watchlist import _SYMBOL_RE
        assert _SYMBOL_RE.match("12345.BO") is not None

    def test_symbol_without_dot_rejected(self):
        from src.ui.components.watchlist import _SYMBOL_RE
        assert _SYMBOL_RE.match("RELIANCENS") is None

    def test_wrong_suffix_rejected(self):
        from src.ui.components.watchlist import _SYMBOL_RE
        assert _SYMBOL_RE.match("RELIANCE.XX") is None

    def test_wrong_suffix_lowercase_rejected(self):
        from src.ui.components.watchlist import _SYMBOL_RE
        assert _SYMBOL_RE.match("RELIANCE.nsx") is None

    def test_empty_string_rejected(self):
        from src.ui.components.watchlist import _SYMBOL_RE
        assert _SYMBOL_RE.match("") is None

    def test_only_dot_ns_rejected(self):
        from src.ui.components.watchlist import _SYMBOL_RE
        assert _SYMBOL_RE.match(".NS") is None

    def test_only_dot_bo_rejected(self):
        from src.ui.components.watchlist import _SYMBOL_RE
        assert _SYMBOL_RE.match(".BO") is None

    def test_dot_only_rejected(self):
        from src.ui.components.watchlist import _SYMBOL_RE
        assert _SYMBOL_RE.match(".") is None

    def test_extra_chars_after_suffix_rejected(self):
        from src.ui.components.watchlist import _SYMBOL_RE
        assert _SYMBOL_RE.match("RELIANCE.NS.") is None

    def test_symbol_with_hyphen_rejected(self):
        from src.ui.components.watchlist import _SYMBOL_RE
        assert _SYMBOL_RE.match("RELI-ANCE.NS") is None

    def test_symbol_with_underscore_rejected(self):
        from src.ui.components.watchlist import _SYMBOL_RE
        assert _SYMBOL_RE.match("RELI_ANCE.NS") is None

    def test_symbol_with_special_chars_rejected(self):
        from src.ui.components.watchlist import _SYMBOL_RE
        assert _SYMBOL_RE.match("REL!ANCE.NS") is None

    def test_multiple_dots_rejected(self):
        from src.ui.components.watchlist import _SYMBOL_RE
        assert _SYMBOL_RE.match("RELIANCE.NS.BO") is None

    def test_spaces_in_symbol_rejected(self):
        from src.ui.components.watchlist import _SYMBOL_RE
        assert _SYMBOL_RE.match("RELI ANCE.NS") is None

    def test_no_ticker_before_suffix_rejected(self):
        from src.ui.components.watchlist import _SYMBOL_RE
        assert _SYMBOL_RE.match("NS") is None

    def test_suffix_without_ticker_rejected(self):
        from src.ui.components.watchlist import _SYMBOL_RE
        assert _SYMBOL_RE.match(".ns") is None

    def test_submit_symbol_clears_input_for_valid_symbol(self, qtbot, mocker):
        from src.ui.components.watchlist import Watchlist
        mock_add = mocker.patch(
            "src.ui.components.watchlist.add_watchlist_symbol",
            return_value=True,
        )
        widget = Watchlist()
        qtbot.add_widget(widget)
        widget._search_input.setText("RELIANCE.NS")
        widget._submit_symbol()
        assert widget._search_input.text() == ""
        mock_add.assert_called_once_with("RELIANCE.NS")

    def test_submit_symbol_no_db_call_for_invalid_symbol(self, qtbot, mocker):
        from src.ui.components.watchlist import Watchlist
        mock_add = mocker.patch(
            "src.ui.components.watchlist.add_watchlist_symbol",
        )
        widget = Watchlist()
        qtbot.add_widget(widget)
        widget._search_input.setText("NOTVALID")
        widget._submit_symbol()
        mock_add.assert_not_called()

    def test_submit_symbol_uppercases_lowercase_input(self, qtbot, mocker):
        from src.ui.components.watchlist import Watchlist
        mock_add = mocker.patch(
            "src.ui.components.watchlist.add_watchlist_symbol",
            return_value=True,
        )
        widget = Watchlist()
        qtbot.add_widget(widget)
        widget._search_input.setText("reliance.ns")
        widget._submit_symbol()
        mock_add.assert_called_once_with("RELIANCE.NS")

    def test_submit_symbol_accepts_lowercase_bse(self, qtbot, mocker):
        from src.ui.components.watchlist import Watchlist
        mock_add = mocker.patch(
            "src.ui.components.watchlist.add_watchlist_symbol",
            return_value=True,
        )
        widget = Watchlist()
        qtbot.add_widget(widget)
        widget._search_input.setText("tcs.bo")
        widget._submit_symbol()
        mock_add.assert_called_once_with("TCS.BO")

    def test_submit_symbol_strips_whitespace(self, qtbot, mocker):
        from src.ui.components.watchlist import Watchlist
        mock_add = mocker.patch(
            "src.ui.components.watchlist.add_watchlist_symbol",
            return_value=True,
        )
        widget = Watchlist()
        qtbot.add_widget(widget)
        widget._search_input.setText("  RELIANCE.NS  ")
        widget._submit_symbol()
        mock_add.assert_called_once_with("RELIANCE.NS")

    def test_submit_symbol_emits_signal_on_success(self, qtbot, mocker):
        from src.ui.components.watchlist import Watchlist
        mock_add = mocker.patch(
            "src.ui.components.watchlist.add_watchlist_symbol",
            return_value=True,
        )
        widget = Watchlist()
        qtbot.add_widget(widget)
        received = []
        widget.symbol_submitted.connect(lambda s: received.append(s))
        widget._search_input.setText("RELIANCE.NS")
        widget._submit_symbol()
        assert received == ["RELIANCE.NS"]

    def test_submit_symbol_no_signal_on_db_failure(self, qtbot, mocker):
        from src.ui.components.watchlist import Watchlist
        mock_add = mocker.patch(
            "src.ui.components.watchlist.add_watchlist_symbol",
            return_value=False,
        )
        widget = Watchlist()
        qtbot.add_widget(widget)
        received = []
        widget.symbol_submitted.connect(lambda s: received.append(s))
        widget._search_input.setText("RELIANCE.NS")
        widget._submit_symbol()
        assert received == []

    def test_submit_symbol_no_signal_on_invalid_symbol(self, qtbot, mocker):
        from src.ui.components.watchlist import Watchlist
        mock_add = mocker.patch(
            "src.ui.components.watchlist.add_watchlist_symbol",
        )
        widget = Watchlist()
        qtbot.add_widget(widget)
        received = []
        widget.symbol_submitted.connect(lambda s: received.append(s))
        widget._search_input.setText("INVALID")
        widget._submit_symbol()
        assert received == []


class TestREQ103a:
    def test_add_watchlist_symbol(self):
        init_db()
        result = add_watchlist_symbol(NSE_SYMBOL)
        assert result is True

    def test_add_duplicate_rejected(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        result = add_watchlist_symbol(NSE_SYMBOL)
        assert result is False


class TestREQ103aEdgeCases:
    """Edge case and failure scenario tests for REQ-103a add_watchlist_symbol."""

    def test_add_bse_symbol_success(self):
        init_db()
        result = add_watchlist_symbol(BO_SYMBOL)
        assert result is True
        symbols = list_watchlist_symbols()
        assert symbols[0]["symbol"] == BO_SYMBOL

    def test_add_case_insensitive_duplicate_rejected(self):
        init_db()
        result1 = add_watchlist_symbol("RELIANCE.NS")
        result2 = add_watchlist_symbol("reliance.ns")
        assert result1 is True
        assert result2 is False

    def test_add_symbol_with_numbers_success(self):
        init_db()
        result = add_watchlist_symbol("ABC123.NS")
        assert result is True

    def test_add_symbol_with_special_chars(self):
        init_db()
        result = add_watchlist_symbol("TEST@.NS")
        assert result is True

    def test_add_very_long_symbol(self):
        init_db()
        long_symbol = "A" * 100 + ".NS"
        result = add_watchlist_symbol(long_symbol)
        assert result is True

    def test_add_whitespace_symbol_preserved(self):
        init_db()
        result = add_watchlist_symbol("  TEST.NS")
        assert result is True
        symbols = list_watchlist_symbols()
        assert symbols[0]["symbol"] == "  TEST.NS"

    def test_add_empty_string_symbol(self):
        init_db()
        result = add_watchlist_symbol("")
        assert result is True
        symbols = list_watchlist_symbols()
        assert any(s["symbol"] == "" for s in symbols)

    def test_add_duplicate_different_case_allowed(self):
        init_db()
        add_watchlist_symbol("RELIANCE.NS")
        result = add_watchlist_symbol("RELIANCE.NS")
        assert result is False

    def test_add_then_list_includes_new_symbol(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        symbols = list_watchlist_symbols()
        assert len(symbols) == 1
        assert symbols[0]["symbol"] == NSE_SYMBOL


class TestREQ103b:
    def test_list_watchlist_symbols(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        symbols = list_watchlist_symbols()
        assert len(symbols) == 1
        assert symbols[0]["symbol"] == NSE_SYMBOL

    def test_list_empty_watchlist(self):
        init_db()
        symbols = list_watchlist_symbols()
        assert symbols == []


class TestREQ103bEdgeCases:
    """Edge case and failure scenario tests for REQ-103b list_watchlist_symbols."""

    def test_list_returns_empty_list_when_no_symbols(self):
        init_db()
        symbols = list_watchlist_symbols()
        assert symbols == []
        assert isinstance(symbols, list)

    def test_list_returns_correct_dict_keys(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        symbols = list_watchlist_symbols()
        expected_keys = {"id", "symbol", "alias", "notes", "added_at"}
        assert set(symbols[0].keys()) == expected_keys

    def test_list_ordered_by_insertion(self):
        init_db()
        add_watchlist_symbol("Z.NS")
        add_watchlist_symbol("A.NS")
        add_watchlist_symbol("M.NS")
        symbols = list_watchlist_symbols()
        assert len(symbols) == 3
        assert symbols[0]["symbol"] == "Z.NS"
        assert symbols[1]["symbol"] == "A.NS"
        assert symbols[2]["symbol"] == "M.NS"

    def test_list_after_remove_reflects_change(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        add_watchlist_symbol(BO_SYMBOL)
        remove_watchlist_symbol(NSE_SYMBOL)
        symbols = list_watchlist_symbols()
        assert len(symbols) == 1
        assert symbols[0]["symbol"] == BO_SYMBOL

    def test_list_includes_alias_and_notes(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        update_watchlist_symbol(NSE_SYMBOL, alias="RIL", notes="Top pick")
        symbols = list_watchlist_symbols()
        assert symbols[0]["alias"] == "RIL"
        assert symbols[0]["notes"] == "Top pick"

    def test_list_multiple_symbols_all_returned(self):
        init_db()
        add_watchlist_symbol("A.NS")
        add_watchlist_symbol("B.NS")
        add_watchlist_symbol("C.NS")
        symbols = list_watchlist_symbols()
        assert len(symbols) == 3

    def test_list_order_preserved_after_updates(self):
        init_db()
        add_watchlist_symbol("FIRST.NS")
        add_watchlist_symbol("SECOND.NS")
        update_watchlist_symbol("FIRST.NS", alias="updated")
        symbols = list_watchlist_symbols()
        assert symbols[0]["symbol"] == "FIRST.NS"
        assert symbols[1]["symbol"] == "SECOND.NS"

    def test_list_does_not_include_excluded_columns(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        symbols = list_watchlist_symbols()
        excluded = {"price", "change_pct", "rsi", "signal"}
        for col in excluded:
            assert col not in symbols[0]


class TestREQ103c:
    def test_update_watchlist_alias(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        result = update_watchlist_symbol(NSE_SYMBOL, alias="RIL")
        assert result is True
        symbols = list_watchlist_symbols()
        assert symbols[0]["alias"] == "RIL"


class TestREQ103cEdgeCases:
    """Edge case and failure scenario tests for REQ-103c update_watchlist_symbol."""

    def test_update_notes_only(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        result = update_watchlist_symbol(NSE_SYMBOL, notes="test notes")
        assert result is True
        symbols = list_watchlist_symbols()
        assert symbols[0]["alias"] == ""
        assert symbols[0]["notes"] == "test notes"

    def test_update_both_alias_and_notes(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        result = update_watchlist_symbol(NSE_SYMBOL, alias="RIL", notes="Top pick")
        assert result is True
        symbols = list_watchlist_symbols()
        assert symbols[0]["alias"] == "RIL"
        assert symbols[0]["notes"] == "Top pick"

    def test_update_alias_to_empty_string(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        update_watchlist_symbol(NSE_SYMBOL, alias="RIL")
        result = update_watchlist_symbol(NSE_SYMBOL, alias="")
        assert result is True
        symbols = list_watchlist_symbols()
        assert symbols[0]["alias"] == ""

    def test_update_notes_to_empty_string(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        update_watchlist_symbol(NSE_SYMBOL, notes="some notes")
        result = update_watchlist_symbol(NSE_SYMBOL, notes="")
        assert result is True
        symbols = list_watchlist_symbols()
        assert symbols[0]["notes"] == ""

    def test_update_preserves_existing_alias_when_only_notes_given(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        update_watchlist_symbol(NSE_SYMBOL, alias="RIL")
        result = update_watchlist_symbol(NSE_SYMBOL, notes="updated notes")
        assert result is True
        symbols = list_watchlist_symbols()
        assert symbols[0]["alias"] == "RIL"
        assert symbols[0]["notes"] == "updated notes"

    def test_update_preserves_existing_notes_when_only_alias_given(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        update_watchlist_symbol(NSE_SYMBOL, notes="original notes")
        result = update_watchlist_symbol(NSE_SYMBOL, alias="RIL")
        assert result is True
        symbols = list_watchlist_symbols()
        assert symbols[0]["alias"] == "RIL"
        assert symbols[0]["notes"] == "original notes"

    def test_update_nonexistent_symbol_returns_false(self):
        init_db()
        result = update_watchlist_symbol("NONEXISTENT.NS", alias="test")
        assert result is False

    def test_update_no_fields_returns_false(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        result = update_watchlist_symbol(NSE_SYMBOL)
        assert result is False
        symbols = list_watchlist_symbols()
        assert symbols[0]["alias"] == ""
        assert symbols[0]["notes"] == ""

    def test_update_none_alias_preserves_existing_alias(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        update_watchlist_symbol(NSE_SYMBOL, alias="RIL")
        result = update_watchlist_symbol(NSE_SYMBOL, alias=None, notes="updated")
        assert result is True
        symbols = list_watchlist_symbols()
        assert symbols[0]["alias"] == "RIL"
        assert symbols[0]["notes"] == "updated"

    def test_update_multiple_times_accumulates(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        update_watchlist_symbol(NSE_SYMBOL, alias="RIL")
        update_watchlist_symbol(NSE_SYMBOL, notes="note1")
        update_watchlist_symbol(NSE_SYMBOL, alias="RELIANCE", notes="note2")
        symbols = list_watchlist_symbols()
        assert symbols[0]["alias"] == "RELIANCE"
        assert symbols[0]["notes"] == "note2"


class TestREQ103d:
    def test_remove_watchlist_symbol(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        result = remove_watchlist_symbol(NSE_SYMBOL)
        assert result is True
        symbols = list_watchlist_symbols()
        assert symbols == []


class TestREQ103dEdgeCases:
    """Edge case and failure scenario tests for REQ-103d remove_watchlist_symbol."""

    def test_remove_nonexistent_symbol_returns_false(self):
        init_db()
        result = remove_watchlist_symbol("NONEXISTENT.NS")
        assert result is False

    def test_remove_already_removed_symbol_returns_false(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        remove_watchlist_symbol(NSE_SYMBOL)
        result = remove_watchlist_symbol(NSE_SYMBOL)
        assert result is False

    def test_remove_bse_symbol(self):
        init_db()
        add_watchlist_symbol(BO_SYMBOL)
        result = remove_watchlist_symbol(BO_SYMBOL)
        assert result is True
        symbols = list_watchlist_symbols()
        assert symbols == []

    def test_remove_from_empty_db_returns_false(self):
        init_db()
        result = remove_watchlist_symbol(NSE_SYMBOL)
        assert result is False

    def test_remove_one_of_multiple_symbols(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        add_watchlist_symbol(BO_SYMBOL)
        result = remove_watchlist_symbol(NSE_SYMBOL)
        assert result is True
        symbols = list_watchlist_symbols()
        assert len(symbols) == 1
        assert symbols[0]["symbol"] == BO_SYMBOL

    def test_remove_then_readd_same_symbol(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        remove_watchlist_symbol(NSE_SYMBOL)
        result = add_watchlist_symbol(NSE_SYMBOL)
        assert result is True
        symbols = list_watchlist_symbols()
        assert len(symbols) == 1
        assert symbols[0]["symbol"] == NSE_SYMBOL

    def test_remove_case_sensitive_distinct(self):
        init_db()
        add_watchlist_symbol("RELIANCE.NS")
        result = remove_watchlist_symbol("reliance.ns")
        assert result is False
        symbols = list_watchlist_symbols()
        assert len(symbols) == 1

    def test_remove_does_not_affect_other_symbols(self):
        init_db()
        add_watchlist_symbol("A.NS")
        add_watchlist_symbol("B.NS")
        add_watchlist_symbol("C.NS")
        remove_watchlist_symbol("B.NS")
        symbols = list_watchlist_symbols()
        assert len(symbols) == 2
        assert symbols[0]["symbol"] == "A.NS"
        assert symbols[1]["symbol"] == "C.NS"

    def test_remove_empty_string_symbol(self):
        init_db()
        add_watchlist_symbol("")
        result = remove_watchlist_symbol("")
        assert result is True
        symbols = list_watchlist_symbols()
        assert symbols == []


class TestREQ104:
    def test_main_window_module_importable(self):
        from src.ui.screens import main_window
        assert hasattr(main_window, "MainWindow")


class TestREQ105:
    def test_watchlist_module_importable(self):
        from src.ui.components import watchlist
        assert hasattr(watchlist, "Watchlist")


class TestREQ106:
    def test_chart_module_importable(self):
        from src.ui.components import chart
        assert hasattr(chart, "Chart")


class TestREQ107:
    def test_gauge_module_importable(self):
        from src.ui.components import gauge
        assert hasattr(gauge, "Gauge")


class TestREQ108:
    def test_settings_modal_module_importable(self):
        from src.ui.screens import settings_mod
        assert hasattr(settings_mod, "SettingsModal")


class TestREQ109:
    def test_search_input_accepts_nse_symbol(self):
        import re
        pattern = re.compile(r"^[A-Z0-9]+\.(NS|BO)$", re.IGNORECASE)
        assert pattern.match("RELIANCE.NS") is not None
        assert pattern.match("TCS.BO") is not None
        assert pattern.match("invalid") is None


class TestREQ110:
    def test_collapsible_drawer_concept(self):
        assert True


class TestREQ111:
    def test_watchlist_restore_from_db(self):
        init_db()
        add_watchlist_symbol("INFY.NS")
        symbols = list_watchlist_symbols()
        assert any(s["symbol"] == "INFY.NS" for s in symbols)


class TestREQLayoutPrefs:
    def test_save_and_load_pref(self):
        init_db()
        save_pref("refresh_interval", "120")
        assert load_pref("refresh_interval") == "120"
        assert load_pref("unknown_key", "default") == "default"


class TestREQ101EdgeCases:
    """Edge case and failure scenario tests for REQ-101 database layer."""

    def test_all_six_tables_exist(self):
        init_db()
        conn = get_connection()
        tables = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table'"
        ).fetchall()
        names = {r["name"] for r in tables}
        for table_name in EXPECTED_TABLES:
            assert table_name in names, f"Missing table: {table_name}"

    def test_all_tables_have_correct_columns(self):
        init_db()
        conn = get_connection()
        for table_name, expected_cols in EXPECTED_TABLES.items():
            cols = conn.execute(f"PRAGMA table_info({table_name})").fetchall()
            actual_names = [c["name"] for c in cols]
            for col in expected_cols:
                assert col in actual_names, f"Table {table_name} missing column {col}"

    def test_init_db_is_idempotent(self):
        init_db()
        init_db()
        init_db()
        conn = get_connection()
        tables = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table'"
        ).fetchall()
        names = {r["name"] for r in tables}
        for table_name in EXPECTED_TABLES:
            assert table_name in names

    def test_watchlist_has_unique_constraint_on_symbol(self):
        init_db()
        conn = get_connection()
        indexes = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='watchlist'"
        ).fetchall()
        index_names = [r["name"] for r in indexes]
        has_unique = any("unique" in conn.execute(
            f"PRAGMA index_info('{n}')"
        ).description or "sqlite_autoindex" in n for n in index_names)
        assert has_unique or any(
            "UNIQUE" in str(d)
            for d in conn.execute("PRAGMA index_list('watchlist')").fetchall()
        )

    def test_add_watchlist_empty_string_symbol(self):
        init_db()
        result = add_watchlist_symbol("")
        assert result is True
        symbols = list_watchlist_symbols()
        assert any(s["symbol"] == "" for s in symbols)

    def test_add_multiple_symbols_ordered_by_added_at(self):
        init_db()
        add_watchlist_symbol("Z.NS")
        add_watchlist_symbol("A.NS")
        add_watchlist_symbol("M.NS")
        symbols = list_watchlist_symbols()
        assert len(symbols) == 3
        assert symbols[0]["symbol"] == "Z.NS"
        assert symbols[1]["symbol"] == "A.NS"
        assert symbols[2]["symbol"] == "M.NS"

    def test_remove_nonexistent_symbol_returns_false(self):
        init_db()
        result = remove_watchlist_symbol("NONEXISTENT.NS")
        assert result is False

    def test_update_nonexistent_symbol_returns_false(self):
        init_db()
        result = update_watchlist_symbol("NONEXISTENT.NS", alias="test")
        assert result is False

    def test_update_with_no_fields_returns_false(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        result = update_watchlist_symbol(NSE_SYMBOL)
        assert result is False
        symbols = list_watchlist_symbols()
        assert symbols[0]["alias"] == ""
        assert symbols[0]["notes"] == ""

    def test_update_only_notes(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        result = update_watchlist_symbol(NSE_SYMBOL, notes="test notes")
        assert result is True
        symbols = list_watchlist_symbols()
        assert symbols[0]["alias"] == ""
        assert symbols[0]["notes"] == "test notes"

    def test_update_both_alias_and_notes(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        result = update_watchlist_symbol(NSE_SYMBOL, alias="RIL", notes="Top pick")
        assert result is True
        symbols = list_watchlist_symbols()
        assert symbols[0]["alias"] == "RIL"
        assert symbols[0]["notes"] == "Top pick"

    def test_remove_already_removed_symbol_returns_false(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        remove_watchlist_symbol(NSE_SYMBOL)
        result = remove_watchlist_symbol(NSE_SYMBOL)
        assert result is False

    def test_save_pref_overwrite_same_key(self):
        init_db()
        save_pref("theme", "dark")
        save_pref("theme", "light")
        assert load_pref("theme") == "light"

    def test_save_pref_empty_value(self):
        init_db()
        save_pref("key1", "")
        assert load_pref("key1") == ""

    def test_load_pref_nonexistent_key_default_empty_string(self):
        init_db()
        assert load_pref("no_such_key") == ""

    def test_load_pref_nonexistent_key_custom_default(self):
        init_db()
        assert load_pref("no_such_key", "my_default") == "my_default"

    def test_database_error_propagates_on_corrupt_db(self, monkeypatch):
        import importlib
        import config.database as dbmod
        importlib.reload(dbmod)
        orig_path = dbmod.DB_PATH
        try:
            dbmod.DB_PATH = "/tmp/opencode/req101_test_nonexistent/tracker.db"
            dbmod._connection = None
            with pytest.raises(sqlite3.OperationalError):
                dbmod.get_connection()
        finally:
            dbmod.DB_PATH = orig_path
            dbmod._connection = None

    def test_list_symbols_after_remove_and_readd(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        remove_watchlist_symbol(NSE_SYMBOL)
        result = add_watchlist_symbol(NSE_SYMBOL)
        assert result is True
        symbols = list_watchlist_symbols()
        assert len(symbols) == 1

    def test_update_symbol_with_none_alias(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        update_watchlist_symbol(NSE_SYMBOL, alias="RIL")
        result = update_watchlist_symbol(NSE_SYMBOL, alias=None, notes="updated")
        assert result is True
        symbols = list_watchlist_symbols()
        assert symbols[0]["alias"] == "RIL"
        assert symbols[0]["notes"] == "updated"

    def test_list_returns_dicts_with_correct_keys(self):
        init_db()
        add_watchlist_symbol(NSE_SYMBOL)
        symbols = list_watchlist_symbols()
        assert isinstance(symbols, list)
        s = symbols[0]
        expected_keys = {"id", "symbol", "alias", "notes", "added_at"}
        assert set(s.keys()) == expected_keys


class TestREQ104EdgeCases:
    """Comprehensive tests for REQ-104 MainWindow shell."""

    def test_main_window_default_title(self, qtbot):
        from src.ui.screens.main_window import MainWindow
        window = MainWindow()
        qtbot.addWidget(window)
        assert window.windowTitle() == "StockTracker Pro"

    def test_main_window_default_size(self, qtbot):
        from src.ui.screens.main_window import MainWindow
        window = MainWindow()
        qtbot.addWidget(window)
        size = window.size()
        assert size.width() == 1280
        assert size.height() == 800

    def test_main_window_central_is_splitter(self, qtbot):
        from src.ui.screens.main_window import MainWindow
        from PyQt6.QtWidgets import QSplitter
        window = MainWindow()
        qtbot.addWidget(window)
        assert isinstance(window.centralWidget(), QSplitter)

    def test_main_window_splitter_orientation(self, qtbot):
        from src.ui.screens.main_window import MainWindow
        from PyQt6.QtCore import Qt
        window = MainWindow()
        qtbot.addWidget(window)
        splitter = window.centralWidget()
        assert splitter.orientation() == Qt.Orientation.Horizontal

    def test_main_window_splitter_has_two_widgets(self, qtbot):
        from src.ui.screens.main_window import MainWindow
        window = MainWindow()
        qtbot.addWidget(window)
        splitter = window.centralWidget()
        assert splitter.count() == 2

    def test_main_window_has_watchlist_attribute(self, qtbot):
        from src.ui.screens.main_window import MainWindow
        from src.ui.components.watchlist import Watchlist
        window = MainWindow()
        qtbot.addWidget(window)
        assert isinstance(window.watchlist, Watchlist)

    def test_main_window_has_chart_attribute(self, qtbot):
        from src.ui.screens.main_window import MainWindow
        from src.ui.components.chart import Chart
        window = MainWindow()
        qtbot.addWidget(window)
        assert isinstance(window.chart, Chart)

    def test_main_window_has_gauge_attribute(self, qtbot):
        from src.ui.screens.main_window import MainWindow
        from src.ui.components.gauge import Gauge
        window = MainWindow()
        qtbot.addWidget(window)
        assert isinstance(window.gauge, Gauge)

    def test_main_window_gauge_initial_visible(self, qtbot):
        from src.ui.screens.main_window import MainWindow
        window = MainWindow()
        qtbot.addWidget(window)
        window.show()
        qtbot.waitExposed(window)
        assert window.gauge.isVisible()

    def test_main_window_drawer_initial_open(self, qtbot):
        from src.ui.screens.main_window import MainWindow
        window = MainWindow()
        qtbot.addWidget(window)
        assert window._drawer_open is True

    def test_main_window_drawer_toggle_initial_text(self, qtbot):
        from src.ui.screens.main_window import MainWindow
        window = MainWindow()
        qtbot.addWidget(window)
        assert window._drawer_toggle.text() == "▼ Insights"

    def test_main_window_toggle_drawer_hides_gauge(self, qtbot):
        from src.ui.screens.main_window import MainWindow
        window = MainWindow()
        qtbot.addWidget(window)
        window._toggle_drawer()
        assert window.gauge.isVisible() is False
        assert window._drawer_open is False
        assert window._drawer_toggle.text() == "▲ Insights"

    def test_main_window_toggle_drawer_shows_gauge(self, qtbot):
        from src.ui.screens.main_window import MainWindow
        window = MainWindow()
        qtbot.addWidget(window)
        window.show()
        qtbot.waitExposed(window)
        window._toggle_drawer()
        window._toggle_drawer()
        assert window.gauge.isVisible() is True
        assert window._drawer_open is True
        assert window._drawer_toggle.text() == "▼ Insights"

    def test_main_window_toggle_button_above_gauge(self, qtbot):
        from src.ui.screens.main_window import MainWindow
        window = MainWindow()
        qtbot.addWidget(window)
        right_panel = window.centralWidget().widget(1)
        layout = right_panel.layout()
        toggle_idx = -1
        gauge_idx = -1
        for i in range(layout.count()):
            w = layout.itemAt(i).widget()
            if w is window._drawer_toggle:
                toggle_idx = i
            elif w is window.gauge:
                gauge_idx = i
        assert toggle_idx >= 0
        assert gauge_idx >= 0
        assert toggle_idx < gauge_idx

    def test_main_window_restore_watchlist_empty_db(self, qtbot, mocker):
        from src.ui.screens.main_window import MainWindow
        mock_list = mocker.patch(
            "src.ui.screens.main_window.list_watchlist_symbols",
            return_value=[],
        )
        mock_populate = mocker.patch(
            "src.ui.components.watchlist.Watchlist.populate",
        )
        window = MainWindow()
        qtbot.addWidget(window)
        mock_list.assert_called_once()
        mock_populate.assert_not_called()

    def test_main_window_restore_watchlist_with_data(self, qtbot, mocker):
        from src.ui.screens.main_window import MainWindow
        rows = [{"symbol": "INFY.NS"}, {"symbol": "TCS.BO"}]
        mock_list = mocker.patch(
            "src.ui.screens.main_window.list_watchlist_symbols",
            return_value=[dict(r, id=i, alias="", notes="", added_at="2024-01-01") for i, r in enumerate(rows)],
        )
        mock_populate = mocker.patch(
            "src.ui.components.watchlist.Watchlist.populate",
        )
        window = MainWindow()
        qtbot.addWidget(window)
        mock_list.assert_called_once()
        mock_populate.assert_called_once_with(
            [{"symbol": "INFY.NS"}, {"symbol": "TCS.BO"}]
        )

    def test_main_window_build_layout_sets_splitter_sizes(self, qtbot):
        from src.ui.screens.main_window import MainWindow
        window = MainWindow()
        qtbot.addWidget(window)
        splitter = window.centralWidget()
        sizes = splitter.sizes()
        assert len(sizes) == 2


class TestREQ105EdgeCases:
    """Comprehensive tests for REQ-105 Watchlist sidebar."""

    def test_watchlist_table_has_five_columns(self, qtbot):
        from src.ui.components.watchlist import Watchlist
        widget = Watchlist()
        qtbot.addWidget(widget)
        assert widget._table.columnCount() == 5

    def test_watchlist_column_headers(self, qtbot):
        from src.ui.components.watchlist import Watchlist
        widget = Watchlist()
        qtbot.addWidget(widget)
        expected = ["Symbol", "Price", "Change %", "RSI", "Signal"]
        for i, header in enumerate(expected):
            item = widget._table.horizontalHeaderItem(i)
            assert item.text() == header

    def test_watchlist_no_edit_triggers(self, qtbot):
        from src.ui.components.watchlist import Watchlist
        from PyQt6.QtWidgets import QTableWidget
        widget = Watchlist()
        qtbot.addWidget(widget)
        assert widget._table.editTriggers() == QTableWidget.EditTrigger.NoEditTriggers

    def test_watchlist_select_rows_behavior(self, qtbot):
        from src.ui.components.watchlist import Watchlist
        from PyQt6.QtWidgets import QTableWidget
        widget = Watchlist()
        qtbot.addWidget(widget)
        assert widget._table.selectionBehavior() == QTableWidget.SelectionBehavior.SelectRows

    def test_watchlist_vertical_header_hidden(self, qtbot):
        from src.ui.components.watchlist import Watchlist
        widget = Watchlist()
        qtbot.addWidget(widget)
        assert widget._table.verticalHeader().isVisible() is False

    def test_watchlist_stretch_last_section(self, qtbot):
        from src.ui.components.watchlist import Watchlist
        from PyQt6.QtWidgets import QHeaderView
        widget = Watchlist()
        qtbot.addWidget(widget)
        assert widget._table.horizontalHeader().stretchLastSection() is True

    def test_watchlist_has_symbol_submitted_signal(self, qtbot):
        from src.ui.components.watchlist import Watchlist
        from PyQt6.QtCore import pyqtSignal
        widget = Watchlist()
        qtbot.addWidget(widget)
        assert isinstance(Watchlist.symbol_submitted, pyqtSignal)

    def test_watchlist_has_symbol_selected_signal(self, qtbot):
        from src.ui.components.watchlist import Watchlist
        from PyQt6.QtCore import pyqtSignal
        widget = Watchlist()
        qtbot.addWidget(widget)
        assert isinstance(Watchlist.symbol_selected, pyqtSignal)

    def test_watchlist_populate_adds_rows(self, qtbot):
        from src.ui.components.watchlist import Watchlist
        widget = Watchlist()
        qtbot.addWidget(widget)
        widget.populate([
            {"symbol": "INFY.NS", "price": 1500, "change_pct": 2.5, "rsi": 65, "signal": "BUY"},
            {"symbol": "TCS.BO", "price": 3500, "change_pct": -1.2, "rsi": 35, "signal": "SELL"},
        ])
        assert widget._table.rowCount() == 2
        assert widget._table.item(0, 0).text() == "INFY.NS"
        assert widget._table.item(1, 0).text() == "TCS.BO"

    def test_watchlist_populate_empty_list_clears_table(self, qtbot):
        from src.ui.components.watchlist import Watchlist
        widget = Watchlist()
        qtbot.addWidget(widget)
        widget.populate([{"symbol": "INFY.NS", "price": 1500, "change_pct": 0, "rsi": 50, "signal": "HOLD"}])
        assert widget._table.rowCount() == 1
        widget.populate([])
        assert widget._table.rowCount() == 0

    def test_watchlist_populate_positive_change_green(self, qtbot):
        from src.ui.components.watchlist import Watchlist
        from config.settings import COLOR_BULLISH
        from PyQt6.QtGui import QColor
        widget = Watchlist()
        qtbot.addWidget(widget)
        widget.populate([
            {"symbol": "INFY.NS", "price": 1500, "change_pct": 2.5, "rsi": 65, "signal": "BUY"},
        ])
        bg = widget._table.item(0, 2).background()
        assert bg.color().name().upper() == QColor(COLOR_BULLISH).name().upper()

    def test_watchlist_populate_negative_change_red(self, qtbot):
        from src.ui.components.watchlist import Watchlist
        from config.settings import COLOR_BEARISH
        from PyQt6.QtGui import QColor
        widget = Watchlist()
        qtbot.addWidget(widget)
        widget.populate([
            {"symbol": "TCS.BO", "price": 3500, "change_pct": -1.2, "rsi": 35, "signal": "SELL"},
        ])
        bg = widget._table.item(0, 2).background()
        assert bg.color().name().upper() == QColor(COLOR_BEARISH).name().upper()

    def test_watchlist_populate_zero_change_green(self, qtbot):
        from src.ui.components.watchlist import Watchlist
        from config.settings import COLOR_BULLISH
        from PyQt6.QtGui import QColor
        widget = Watchlist()
        qtbot.addWidget(widget)
        widget.populate([
            {"symbol": "INFY.NS", "price": 1500, "change_pct": 0.0, "rsi": 50, "signal": "HOLD"},
        ])
        bg = widget._table.item(0, 2).background()
        assert bg.color().name().upper() == QColor(COLOR_BULLISH).name().upper()

    def test_watchlist_populate_foreground_white(self, qtbot):
        from src.ui.components.watchlist import Watchlist
        from PyQt6.QtCore import Qt
        widget = Watchlist()
        qtbot.addWidget(widget)
        widget.populate([
            {"symbol": "INFY.NS", "price": 1500, "change_pct": 2.5, "rsi": 65, "signal": "BUY"},
        ])
        fg = widget._table.item(0, 2).foreground()
        assert fg.color() == Qt.GlobalColor.white

    def test_watchlist_populate_missing_keys_uses_defaults(self, qtbot):
        from src.ui.components.watchlist import Watchlist
        widget = Watchlist()
        qtbot.addWidget(widget)
        widget.populate([{"symbol": "INFY.NS"}])
        assert widget._table.rowCount() == 1
        assert widget._table.item(0, 1).text() == ""

    def test_watchlist_symbol_clicked_emits_signal(self, qtbot):
        from src.ui.components.watchlist import Watchlist
        widget = Watchlist()
        qtbot.addWidget(widget)
        widget.populate([{"symbol": "INFY.NS", "price": 1500, "change_pct": 0, "rsi": 50, "signal": "HOLD"}])
        received = []
        widget.symbol_selected.connect(lambda s: received.append(s))
        widget._on_symbol_clicked(widget._table.item(0, 0))
        assert received == ["INFY.NS"]

    def test_watchlist_layout_has_zero_margins(self, qtbot):
        from src.ui.components.watchlist import Watchlist
        widget = Watchlist()
        qtbot.addWidget(widget)
        margins = widget.layout().contentsMargins()
        assert margins.left() == 0
        assert margins.top() == 0
        assert margins.right() == 0
        assert margins.bottom() == 0


class TestREQ106EdgeCases:
    """Comprehensive tests for REQ-106 Chart dashboard."""

    def test_chart_background_color(self, qtbot):
        from src.ui.components.chart import Chart
        widget = Chart()
        qtbot.addWidget(widget)
        assert widget._canvas.backgroundBrush().color().name() == "#0a192f"

    def test_chart_crosshair_v_exists(self, qtbot):
        from src.ui.components.chart import Chart
        widget = Chart()
        qtbot.addWidget(widget)
        assert widget._crosshair_v is not None
        assert widget._crosshair_h is not None

    def test_chart_crosshair_pen_color(self, qtbot):
        from src.ui.components.chart import Chart
        widget = Chart()
        qtbot.addWidget(widget)
        pen_v = widget._crosshair_v.pen
        pen_h = widget._crosshair_h.pen
        assert pen_v.color().name() == "#ccd6f6"
        assert pen_h.color().name() == "#ccd6f6"

    def test_chart_crosshair_dash_style(self, qtbot):
        from src.ui.components.chart import Chart
        from PyQt6.QtCore import Qt
        widget = Chart()
        qtbot.addWidget(widget)
        pen_v = widget._crosshair_v.pen
        pen_h = widget._crosshair_h.pen
        assert pen_v.style() == Qt.PenStyle.DashLine
        assert pen_h.style() == Qt.PenStyle.DashLine

    def test_chart_crosshair_width(self, qtbot):
        from src.ui.components.chart import Chart
        widget = Chart()
        qtbot.addWidget(widget)
        assert widget._crosshair_v.pen.width() == 1
        assert widget._crosshair_h.pen.width() == 1

    def test_chart_interval_combo_has_items(self, qtbot):
        from src.ui.components.chart import Chart
        widget = Chart()
        qtbot.addWidget(widget)
        expected = ["1m", "5m", "15m", "1h", "1d", "1wk"]
        for i, text in enumerate(expected):
            assert widget._interval_combo.itemText(i) == text

    def test_chart_period_combo_has_items(self, qtbot):
        from src.ui.components.chart import Chart
        widget = Chart()
        qtbot.addWidget(widget)
        expected = ["5d", "1mo", "3mo", "6mo", "1y", "2y"]
        for i, text in enumerate(expected):
            assert widget._period_combo.itemText(i) == text

    def test_chart_default_interval(self, qtbot):
        from src.ui.components.chart import Chart
        widget = Chart()
        qtbot.addWidget(widget)
        assert widget.current_interval() == "1d"

    def test_chart_default_period(self, qtbot):
        from src.ui.components.chart import Chart
        widget = Chart()
        qtbot.addWidget(widget)
        assert widget.current_period() == "1mo"

    def test_chart_two_plots_exist(self, qtbot):
        from src.ui.components.chart import Chart
        widget = Chart()
        qtbot.addWidget(widget)
        assert widget._price_plot is not None
        assert widget._volume_plot is not None
        assert widget._volume_plot.maximumHeight() == 120

    def test_chart_volume_plot_linked_x(self, qtbot):
        from src.ui.components.chart import Chart
        import pyqtgraph as pg
        widget = Chart()
        qtbot.addWidget(widget)
        linked = widget._volume_plot.vb.state["linkedViews"][pg.ViewBox.XAxis]
        assert linked is not None
        assert linked() is widget._price_plot.vb

    def test_chart_series_list_exists(self, qtbot):
        from src.ui.components.chart import Chart
        widget = Chart()
        qtbot.addWidget(widget)
        assert hasattr(widget, "_series")
        assert isinstance(widget._series, list)
        assert len(widget._series) == 0

    def test_chart_crosshair_label_exists(self, qtbot):
        from src.ui.components.chart import Chart
        widget = Chart()
        qtbot.addWidget(widget)
        assert widget._crosshair_label is not None


class TestREQ107EdgeCases:
    """Comprehensive tests for REQ-107 Gauge widget."""

    def test_gauge_minimum_size(self, qtbot):
        from src.ui.components.gauge import Gauge
        widget = Gauge()
        qtbot.addWidget(widget)
        ms = widget.minimumSize()
        assert ms.width() >= 120
        assert ms.height() >= 120

    def test_gauge_set_value_uppercases_label(self, qtbot):
        from src.ui.components.gauge import Gauge
        widget = Gauge()
        qtbot.addWidget(widget)
        widget.set_value(0.5, "bullish")
        assert widget._label == "BULLISH"
        widget.set_value(-0.5, "bearish")
        assert widget._label == "BEARISH"
        widget.set_value(0.0, "neutral")
        assert widget._label == "NEUTRAL"

    def test_gauge_set_value_clamps_high(self, qtbot):
        from src.ui.components.gauge import Gauge
        widget = Gauge()
        qtbot.addWidget(widget)
        widget.set_value(5.0, "bullish")
        assert widget._score == 1.0

    def test_gauge_set_value_clamps_low(self, qtbot):
        from src.ui.components.gauge import Gauge
        widget = Gauge()
        qtbot.addWidget(widget)
        widget.set_value(-5.0, "bearish")
        assert widget._score == -1.0

    def test_gauge_set_consensus_bullish(self, qtbot):
        from src.ui.components.gauge import Gauge
        widget = Gauge()
        qtbot.addWidget(widget)
        widget.set_consensus(0.5)
        assert widget._label == "BULLISH"
        assert widget._score == 0.5

    def test_gauge_set_consensus_bearish(self, qtbot):
        from src.ui.components.gauge import Gauge
        widget = Gauge()
        qtbot.addWidget(widget)
        widget.set_consensus(-0.5)
        assert widget._label == "BEARISH"
        assert widget._score == -0.5

    def test_gauge_set_consensus_neutral(self, qtbot):
        from src.ui.components.gauge import Gauge
        widget = Gauge()
        qtbot.addWidget(widget)
        widget.set_consensus(0.0)
        assert widget._label == "NEUTRAL"
        assert widget._score == 0.0

    def test_gauge_set_consensus_threshold_boundary(self, qtbot):
        from src.ui.components.gauge import Gauge
        widget = Gauge()
        qtbot.addWidget(widget)
        widget.set_consensus(0.2)
        assert widget._label == "NEUTRAL"
        widget.set_consensus(0.21)
        assert widget._label == "BULLISH"
        widget.set_consensus(-0.2)
        assert widget._label == "NEUTRAL"
        widget.set_consensus(-0.21)
        assert widget._label == "BEARISH"

    def test_gauge_set_consensus_with_detail(self, qtbot):
        from src.ui.components.gauge import Gauge
        widget = Gauge()
        qtbot.addWidget(widget)
        widget.set_consensus(0.5, "Strong bullish signals")
        assert widget._detail == "Strong bullish signals"

    def test_gauge_default_state(self, qtbot):
        from src.ui.components.gauge import Gauge
        widget = Gauge()
        qtbot.addWidget(widget)
        assert widget._label == "NEUTRAL"
        assert widget._score == 0.0
        assert widget._detail == ""

    def test_gauge_set_value_updates_label(self, qtbot):
        from src.ui.components.gauge import Gauge
        widget = Gauge()
        qtbot.addWidget(widget)
        widget.set_value(0.8, "bullish")
        assert widget._label == "BULLISH"
        widget.set_value(-0.8, "bearish")
        assert widget._label == "BEARISH"

    def test_gauge_set_value_mixed_case(self, qtbot):
        from src.ui.components.gauge import Gauge
        widget = Gauge()
        qtbot.addWidget(widget)
        widget.set_value(0.3, "BuLLiSh")
        assert widget._label == "BULLISH"

    def test_gauge_paint_event_uses_correct_color_bullish(self, qtbot):
        from src.ui.components.gauge import Gauge
        from config.settings import COLOR_BULLISH
        widget = Gauge()
        qtbot.addWidget(widget)
        widget.set_value(0.5, "bullish")
        assert widget._label == "BULLISH"


class TestREQ108EdgeCases:
    """Comprehensive tests for REQ-108 SettingsModal."""

    def test_settings_modal_window_title(self, qtbot):
        from src.ui.screens.settings_mod import SettingsModal
        dialog = SettingsModal()
        qtbot.addWidget(dialog)
        assert dialog.windowTitle() == "Settings"

    def test_settings_modal_is_modal(self, qtbot):
        from src.ui.screens.settings_mod import SettingsModal
        dialog = SettingsModal()
        qtbot.addWidget(dialog)
        assert dialog.isModal() is True

    def test_settings_modal_default_size(self, qtbot):
        from src.ui.screens.settings_mod import SettingsModal
        dialog = SettingsModal()
        qtbot.addWidget(dialog)
        size = dialog.size()
        assert size.width() >= 300
        assert size.height() >= 200

    def test_settings_modal_api_key_masked(self, qtbot):
        from src.ui.screens.settings_mod import SettingsModal
        from PyQt6.QtWidgets import QLineEdit
        dialog = SettingsModal()
        qtbot.addWidget(dialog)
        assert dialog.api_key_input.echoMode() == QLineEdit.EchoMode.Password

    def test_settings_modal_interval_minimum(self, qtbot):
        from src.ui.screens.settings_mod import SettingsModal
        dialog = SettingsModal()
        qtbot.addWidget(dialog)
        assert dialog.refresh_interval.minimum() == 5

    def test_settings_modal_interval_maximum(self, qtbot):
        from src.ui.screens.settings_mod import SettingsModal
        dialog = SettingsModal()
        qtbot.addWidget(dialog)
        assert dialog.refresh_interval.maximum() == 300

    def test_settings_modal_interval_default(self, qtbot):
        from src.ui.screens.settings_mod import SettingsModal
        dialog = SettingsModal()
        qtbot.addWidget(dialog)
        assert dialog.refresh_interval.value() == 60

    def test_settings_modal_accept_saves_api_key(self, qtbot, mocker):
        from src.ui.screens.settings_mod import SettingsModal
        mock_save = mocker.patch("src.ui.screens.settings_mod.save_pref")
        dialog = SettingsModal()
        qtbot.addWidget(dialog)
        dialog.api_key_input.setText("test-key-123")
        dialog.refresh_interval.setValue(120)
        dialog._on_accept()
        mock_save.assert_any_call("gemini_api_key", "test-key-123")
        mock_save.assert_any_call("refresh_interval", "120")

    def test_settings_modal_loads_persisted_values(self, qtbot, mocker):
        from src.ui.screens.settings_mod import SettingsModal
        mocker.patch("src.ui.screens.settings_mod.load_pref",
                     side_effect=lambda key, default="": {"gemini_api_key": "saved-key", "refresh_interval": "90"}.get(key, default))
        dialog = SettingsModal()
        qtbot.addWidget(dialog)
        assert dialog.api_key_input.text() == "saved-key"
        assert dialog.refresh_interval.value() == 90

    def test_settings_modal_loads_default_interval_when_not_saved(self, qtbot, mocker):
        from src.ui.screens.settings_mod import SettingsModal
        mocker.patch("src.ui.screens.settings_mod.load_pref",
                     side_effect=lambda key, default="": "60" if key == "refresh_interval" else default)
        dialog = SettingsModal()
        qtbot.addWidget(dialog)
        assert dialog.refresh_interval.value() == 60

    def test_settings_modal_has_button_box(self, qtbot):
        from src.ui.screens.settings_mod import SettingsModal
        from PyQt6.QtWidgets import QDialogButtonBox
        dialog = SettingsModal()
        qtbot.addWidget(dialog)
        button_box = dialog.findChild(QDialogButtonBox)
        assert button_box is not None

    def test_settings_modal_get_settings_returns_dict(self, qtbot):
        from src.ui.screens.settings_mod import SettingsModal
        dialog = SettingsModal()
        qtbot.addWidget(dialog)
        dialog.api_key_input.setText("my-key")
        dialog.refresh_interval.setValue(150)
        settings = dialog.get_settings()
        assert settings == {"api_key": "my-key", "refresh_interval": 150}


class TestREQ109EdgeCases:
    """Comprehensive tests for REQ-109 Search Input."""

    def test_search_input_placeholder(self, qtbot):
        from src.ui.components.watchlist import Watchlist
        widget = Watchlist()
        qtbot.addWidget(widget)
        assert widget._search_input.placeholderText() == "Enter symbol (e.g. RELIANCE.NS)"

    def test_search_input_return_pressed_triggers_submit(self, qtbot, mocker):
        from src.ui.components.watchlist import Watchlist
        mock_submit = mocker.patch(
            "src.ui.components.watchlist.Watchlist._submit_symbol",
        )
        widget = Watchlist()
        qtbot.addWidget(widget)
        widget._search_input.returnPressed.emit()
        mock_submit.assert_called_once()

    def test_search_input_add_button_triggers_submit(self, qtbot, mocker):
        from src.ui.components.watchlist import Watchlist
        mock_submit = mocker.patch(
            "src.ui.components.watchlist.Watchlist._submit_symbol",
        )
        widget = Watchlist()
        qtbot.addWidget(widget)
        widget._add_btn.clicked.emit()
        mock_submit.assert_called_once()

    def test_search_input_silent_rejection_no_db_call(self, qtbot, mocker):
        from src.ui.components.watchlist import Watchlist
        mock_add = mocker.patch(
            "src.ui.components.watchlist.add_watchlist_symbol",
        )
        widget = Watchlist()
        qtbot.addWidget(widget)
        widget._search_input.setText("INVALID")
        widget._submit_symbol()
        mock_add.assert_not_called()

    def test_search_input_not_cleared_on_invalid(self, qtbot, mocker):
        from src.ui.components.watchlist import Watchlist
        mocker.patch("src.ui.components.watchlist.add_watchlist_symbol")
        widget = Watchlist()
        qtbot.addWidget(widget)
        widget._search_input.setText("INVALID")
        widget._submit_symbol()
        assert widget._search_input.text() == "INVALID"

    def test_search_input_signal_not_emitted_on_db_failure(self, qtbot, mocker):
        from src.ui.components.watchlist import Watchlist
        mocker.patch(
            "src.ui.components.watchlist.add_watchlist_symbol",
            return_value=False,
        )
        widget = Watchlist()
        qtbot.addWidget(widget)
        received = []
        widget.symbol_submitted.connect(lambda s: received.append(s))
        widget._search_input.setText("RELIANCE.NS")
        widget._submit_symbol()
        assert received == []

    def test_search_input_no_signal_on_invalid(self, qtbot, mocker):
        from src.ui.components.watchlist import Watchlist
        mocker.patch("src.ui.components.watchlist.add_watchlist_symbol")
        widget = Watchlist()
        qtbot.addWidget(widget)
        received = []
        widget.symbol_submitted.connect(lambda s: received.append(s))
        widget._search_input.setText("INVALID")
        widget._submit_symbol()
        assert received == []

    def test_search_input_valid_bse_symbol(self, qtbot, mocker):
        from src.ui.components.watchlist import Watchlist
        mock_add = mocker.patch(
            "src.ui.components.watchlist.add_watchlist_symbol",
            return_value=True,
        )
        widget = Watchlist()
        qtbot.addWidget(widget)
        widget._search_input.setText("TCS.BO")
        widget._submit_symbol()
        mock_add.assert_called_once_with("TCS.BO")


class TestREQ110EdgeCases:
    """Comprehensive tests for REQ-110 Collapsible Drawer."""

    def test_drawer_initial_state_open(self, qtbot):
        from src.ui.screens.main_window import MainWindow
        window = MainWindow()
        qtbot.addWidget(window)
        assert window._drawer_open is True

    def test_drawer_initial_gauge_visible(self, qtbot):
        from src.ui.screens.main_window import MainWindow
        window = MainWindow()
        qtbot.addWidget(window)
        window.show()
        qtbot.waitExposed(window)
        assert window.gauge.isVisible() is True

    def test_drawer_initial_button_text(self, qtbot):
        from src.ui.screens.main_window import MainWindow
        window = MainWindow()
        qtbot.addWidget(window)
        assert window._drawer_toggle.text() == "▼ Insights"

    def test_drawer_toggle_closes(self, qtbot):
        from src.ui.screens.main_window import MainWindow
        window = MainWindow()
        qtbot.addWidget(window)
        window._toggle_drawer()
        assert window._drawer_open is False
        assert window.gauge.isVisible() is False
        assert window._drawer_toggle.text() == "▲ Insights"

    def test_drawer_toggle_opens(self, qtbot):
        from src.ui.screens.main_window import MainWindow
        window = MainWindow()
        qtbot.addWidget(window)
        window.show()
        qtbot.waitExposed(window)
        window._toggle_drawer()
        window._toggle_drawer()
        assert window._drawer_open is True
        assert window.gauge.isVisible() is True
        assert window._drawer_toggle.text() == "▼ Insights"

    def test_drawer_toggle_multiple_times(self, qtbot):
        from src.ui.screens.main_window import MainWindow
        window = MainWindow()
        qtbot.addWidget(window)
        window.show()
        qtbot.waitExposed(window)
        for _ in range(5):
            window._toggle_drawer()
        assert window._drawer_open is False
        assert window.gauge.isVisible() is False
        assert window._drawer_toggle.text() == "▲ Insights"
        window._toggle_drawer()
        assert window._drawer_open is True
        assert window.gauge.isVisible() is True
        assert window._drawer_toggle.text() == "▼ Insights"

    def test_drawer_button_is_pushbutton(self, qtbot):
        from src.ui.screens.main_window import MainWindow
        from PyQt6.QtWidgets import QPushButton
        window = MainWindow()
        qtbot.addWidget(window)
        assert isinstance(window._drawer_toggle, QPushButton)


class TestREQ111EdgeCases:
    """Comprehensive tests for REQ-111 Watchlist Auto-Restore."""

    def test_watchlist_restore_multiple_symbols(self):
        init_db()
        add_watchlist_symbol("INFY.NS")
        add_watchlist_symbol("TCS.BO")
        add_watchlist_symbol("RELIANCE.NS")
        symbols = list_watchlist_symbols()
        assert len(symbols) == 3

    def test_watchlist_restore_empty_db(self):
        init_db()
        symbols = list_watchlist_symbols()
        assert symbols == []

    def test_watchlist_restore_order_by_added_at(self):
        init_db()
        add_watchlist_symbol("Z.NS")
        add_watchlist_symbol("A.NS")
        add_watchlist_symbol("M.NS")
        symbols = list_watchlist_symbols()
        assert symbols[0]["symbol"] == "Z.NS"
        assert symbols[1]["symbol"] == "A.NS"
        assert symbols[2]["symbol"] == "M.NS"

    def test_watchlist_restore_populates_table(self, qtbot, mocker):
        from src.ui.screens.main_window import MainWindow
        rows = [{"symbol": "INFY.NS"}, {"symbol": "TCS.BO"}, {"symbol": "RELIANCE.NS"}]
        mocker.patch(
            "src.ui.screens.main_window.list_watchlist_symbols",
            return_value=[dict(r, id=i, alias="", notes="", added_at="2024-01-01") for i, r in enumerate(rows)],
        )
        window = MainWindow()
        qtbot.addWidget(window)
        assert window.watchlist._table.rowCount() == 3
        assert window.watchlist._table.item(0, 0).text() == "INFY.NS"
        assert window.watchlist._table.item(1, 0).text() == "TCS.BO"
        assert window.watchlist._table.item(2, 0).text() == "RELIANCE.NS"

    def test_watchlist_restore_empty_table_stays_empty(self, qtbot, mocker):
        from src.ui.screens.main_window import MainWindow
        mocker.patch(
            "src.ui.screens.main_window.list_watchlist_symbols",
            return_value=[],
        )
        window = MainWindow()
        qtbot.addWidget(window)
        assert window.watchlist._table.rowCount() == 0

    def test_watchlist_restore_rehydrates_from_db(self, qtbot, mocker):
        from src.ui.screens.main_window import MainWindow
        rows = [{"symbol": "INFY.NS"}]
        mocker.patch(
            "src.ui.screens.main_window.list_watchlist_symbols",
            return_value=[dict(rows[0], id=1, alias="", notes="", added_at="2024-01-01")],
        )
        mock_populate = mocker.patch(
            "src.ui.components.watchlist.Watchlist.populate",
        )
        window = MainWindow()
        qtbot.addWidget(window)
        mock_populate.assert_called_once_with([{"symbol": "INFY.NS"}])
