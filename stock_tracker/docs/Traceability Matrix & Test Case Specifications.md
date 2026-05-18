
`test_phase1_shell.py` (Local Data & UI Framework)

- **`test_sqlite_schema_initialization` [REQ-101]:** Asserts that `tracker.db` initializes with correct columns, tables (`watchlist`, `settings`), and index structures.
- **`test_ticker_validation_rules` [REQ-102]:** Validates string inputs. Asserts `RELIANCE.NS` and `TCS.BO` pass, while `AAPL`, `INVALID$`, or empty inputs raise parsing exceptions.
- **`test_watchlist_crud_operations` [REQ-103]:** Asserts that appending a valid ticker updates rows, retrieving lists functions correctly, and dropping a row leaves other database instances intact.
    
- **`test_main_window_split_layout` [REQ-104]:** Uses `pytest-qt` to assert `QMainWindow` initializes with a central split panel container.
- **`test_sidebar_grid_elements` [REQ-105]:** Asserts the left panel displays a `QTableView` with correct tracking column properties and functional text filters.
- **`test_charting_dashboard_placeholders` [REQ-106]:** Asserts that the layout contains a dedicated graphics view box and interval configuration buttons (5m, 15m, 1D).
- **`test_recommendation_gauge_visibility` [REQ-107]:** Asserts that the drawer canvas renders visual labels for indicators, sentiment analysis metrics, and corporate event containers.
- **`test_settings_modal_dialog` [REQ-108]:** Simulates clicks opening the modular setting box. Asserts that updates to local polling variables update properly.

`test_phase2_wiring.py` (Asynchronous Processing & Charting)

- **`test_qthread_ui_isolation` [REQ-201]:** Asserts that long-running tasks operate outside the main thread identification scope.
- **`test_yfinance_parser_mapping` [REQ-202]:** Mocks the market network payload to assert that raw input feeds correctly populate historical structural arrays (OHLCV columns).
- **`test_automated_polling_timer` [REQ-203]:** Uses mocked time intervals to confirm that update signals are fired precisely every 60 seconds.
- **`test_pyqtgraph_candlestick_injection` [REQ-204]:** Asserts that updating data objects signals `pyqtgraph` to clear old arrays and repaint a matching total of data coordinates.
- **`test_canvas_mouse_event_triggers` [REQ-205]:** Generates simulated mouse drags and scrolls over the graphic container to confirm tracking events execute properly.

`test_phase3_intelligence.py` (Recommendation Engine & AI)

- `test_vectorized_indicator_math` [REQ-301]: Feeds a hardcoded static array into the calculation layer. Output values for SMA-50, RSI-14, and MACD match exact reference baselines.
- `test_regulatory_action_keyword_filter` [REQ-302]: Feeds mock exchange string files into the script to verify regex keywords (e.g., _Dividend_, _Bonus_, _AGM_) trigger alerts.
- `test_gemini_api_sentiment_scoring` [REQ-303]: Mocks the Gemini endpoint response. Input strings return a cleanly formatted decimal between `-1.0` (Bearish) and `+1.0` (Bullish).
- `test_tri_factor_consensus_math` [REQ-304]: Exercises the mathematical rules routing. Specific combinations of technical trends and sentiment scores resolve to the appropriate verdict status (_Strong Buy_, _Hold_, _Sell_).

`test_phase4_nfr_gates.py` (Non-Functional Quality Gates)

- `test_ui_fps_under_load` [REQ-401]: Simulates 50 background data flushes per second. Measures execution frame timings to ensure frame updates stay ≤16.6ms (≥60 FPS).
- `test_render_latency_large_dataset` [REQ-402]: Loads a massive 365-day tracking data file. Measures canvas axis recalculation speeds to ensure response times remain ≤500ms during manual zooming.
- `test_network_failure_retry_limit` [REQ-403]: Drops the network layer connection. Verifies the application loops through 3 consecutive re-queries before changing state to an offline layout warning without crashing.
- `test_sqlite_file_footprint_limit` [REQ-404]: Simulates high-velocity insert workloads over a 12-hour automated cycle. Measures the absolute file footprint size to confirm storage overhead stays under 50MB.

`test_phase5_delivery.py` (Compliance & Packaging)

- `test_sebi_disclaimer_anchor` [REQ-501]: Inspects UI nodes to confirm that an immutable label containing statutory advisory alerts is constantly visible in the drawer panel.
- `test_binary_artifact_compilation` [REQ-502]: Runs after execution scripts build. Verifies that PyInstaller outputs a valid, launchable distribution artifact matching execution properties.

---