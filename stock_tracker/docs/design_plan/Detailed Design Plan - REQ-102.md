**Target Ticker Validation Framework**

- **Role**  
    Lead UI/Frontend Engineer.
- **Task**  
    Implement a regex-based validation layer that enforces the NSE/BSE ticker suffix convention before symbol data enters the application pipeline.
- **Context**  
    All stock symbols must follow the format `SYMBOL.NS` (NSE) or `SYMBOL.BO` (BSE) to disambiguate exchange listing. The validation is executed client-side in the `Watchlist` widget's `_submit_symbol()` method before the symbol is passed to `add_watchlist_symbol()` in the database layer. A global compiled regex (`_SYMBOL_RE`) serves as the single source of truth for acceptable symbol patterns.
- **Constraints**
    - **Regex Constraint:** The pattern `^[A-Z0-9]+\.(NS|BO)$` must be compiled with `re.IGNORECASE`. Only alphanumeric tickers followed by exactly `.NS` or `.BO` are valid.
    - **Case Handling:** The raw input is converted to uppercase via `.strip().upper()` before matching. The regex flag is `re.IGNORECASE` for defence in depth.
    - **Fail-Silent:** Invalid input causes the symbol to be silently rejected – no error dialog, no database call.
- **Format**  
    A module-level compiled regex object (`_SYMBOL_RE`) in `src/ui/components/watchlist.py`. Validation is invoked inline inside `Watchlist._submit_symbol()`. No separate validator class or function wrapper is used.
- **Acceptance Criteria** (mapped to TestREQ102 in `tests/test_phase1_shell.py`)
    1. NSE symbol `"RELIANCE.NS"` has `.NS` suffix (valid).
    2. BSE symbol `"TCS.BO"` has `.BO` suffix (valid).
    3. Invalid symbol `"NOTVALID"` does not end with `.NS` or `.BO` (rejected).
