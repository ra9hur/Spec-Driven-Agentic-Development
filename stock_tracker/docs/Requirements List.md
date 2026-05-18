
Phase 1: Local Data & UI Framework (The Shell)

1. **[REQ-101] Local Relational Storage Engine Initialization**
    Configure an embedded `SQLite` database containing isolated schemas for user watchlists, layout preferences, and cache states.

2. **[REQ-102] Target Ticker Validation Framework**
    Enforce structural input validation formatting for Indian equity scrips matching standard NSE (`.NS`) and BSE (`.BO`) naming standards.

3. **[REQ-103a] Watchlist Data Management API — Add Ticker**
    Implement atomic INSERT of a tracked ticker symbol into the watchlist database with duplicate-key rejection.

4. **[REQ-103b] Watchlist Data Management API — List Tickers**
    Implement SELECT query to retrieve all stored watchlist symbols and their metadata from the database layer.

5. **[REQ-103c] Watchlist Data Management API — Update Ticker**
    Implement UPDATE operation to modify an existing watchlist entry's metadata (alias, notes).

6. **[REQ-103d] Watchlist Data Management API — Remove Ticker**
    Implement DELETE operation to remove a ticker from the watchlist by symbol.

7. **[REQ-104] Native GUI Main Window Shell**
    Construct the fundamental desktop viewport container utilizing `PyQt6` structured around a clean split-panel grid view.

8. **[REQ-105] Watchlist Navigation Sidebar UI**
    Create a permanent left-aligned sidebar panel containing the active ticker data grid, daily price change percentages, and a search submission input bar.

9. **[REQ-106] Main Interacting Charting Dashboard UI**
    Build the central viewport section housing the multi-axis canvas, candle configuration toggles (e.g., 5m, 15m, 1D), and active crosshair tracking labels.

10. **[REQ-107] Tri-Factor Recommendation Gauge & Insights Panel UI**
    Design a lower collapsible drawer view containing a visual color-coded recommendation dial (Buy/Sell/Hold) alongside placeholder blocks for AI data text.

11. **[REQ-108] Global Settings & Configuration Window UI**
    Implement a separate modal popup dialogue window for modifying data refresh intervals, local database paths, and third-party AI API credentials.

12. **[REQ-109] Ticker Search Submission Input Bar**
    Add a text input field at the top of the sidebar that validates user-entered symbols for .NS/.BO suffix conformance before submitting to the watchlist.

13. **[REQ-110] Lower Collapsible Recommendation Drawer**
    Implement a toggle-able lower panel that slides open/closed to reveal the consensus recommendation gauge and AI insight text blocks.

14. **[REQ-111] Watchlist Auto-Restore on Application Launch**
    On startup, read the persisted watchlist table from SQLite and re-populate the sidebar grid automatically so the user sees their last session.

Phase 2: Asynchronous Data Processing & High-FPS Charting (The Wiring)

15. **[REQ-201] Multi-Threaded Worker Controller (`QThread`)**
    Isolate all data fetch operations onto background loops to guarantee primary UI thread updates stay within a 16.6ms window.

16. **[REQ-202] Delayed REST Market Polling Pipeline**
    Connect worker processes to `yfinance` endpoints to fetch ~15-minute delayed OHLCV metrics for Indian tickers.

17. **[REQ-203] Deterministic Automated Refresh Loop**
    Trigger network update queries precisely every 60 seconds with graceful recovery fallbacks for internet connection dropouts.

18. **[REQ-204a] pyqtgraph Viewport Embedding and Axis Configuration**
    Embed a hardware-accelerated `pyqtgraph` `GraphicsLayoutWidget` as the chart canvas with labeled price/time axes and grid lines.

19. **[REQ-204b] Candlestick and Volume Bar Series Rendering**
    Paint candlestick bodies, wicks, and volume histogram bars onto the pyqtgraph viewport from OHLCV data arrays without blocking the UI thread.

20. **[REQ-205] Continuous Axis Interactivity Controllers**
    Map sub-second mouse bindings to execute fluid zoom scale manipulations, directional horizontal panning, and tracking crosshairs.

21. **[REQ-206] Volume Bar Histogram Rendering**
    Render a synchronized volume histogram sub-plot below the main candlestick chart, color-coded green/red matching the candle direction.

22. **[REQ-207] Chart Crosshair Tracking Labels**
    Display real-time crosshair lines (vertical + horizontal) that follow the mouse position over the chart, with a tooltip showing OHLC values at the hovered bar.

23. **[REQ-208] Interval and Period Configuration Toggles**
    Provide a set of toggle buttons or a dropdown (5m, 15m, 1D, 1W) above the chart that re-fetches and re-renders data at the selected granularity.

Phase 3: Tri-Factor Recommendation Engine & AI Inference (The Intelligence)

24. **[REQ-301a] Simple Moving Average (SMA) Calculation**
    Compute SMA for configurable windows (20, 50, 200) using vectorized pandas rolling operations and overlay them on the chart.

25. **[REQ-301b] Relative Strength Index (RSI-14) Calculation**
    Compute RSI-14 using the standard smoothed Wilder's method and return values normalized between 0–100.

26. **[REQ-301c] MACD Line, Signal, and Histogram Calculation**
    Compute MACD line (12/26 EMA difference), signal line (9-period EMA of MACD), and histogram (MACD − signal) using vectorized ewm operations.

27. **[REQ-302] Corporate Regulatory Actions Text Extraction**
    Implement scanning scripts to strip and filter recent exchange announcements for targeted corporate action keywords.

28. **[REQ-303] Zero-Cost AI Sentiment Pipeline**
    Integrate free-tier Google Gemini API endpoints using the official SDK to analyze financial text strings for polarity scores.

29. **[REQ-304a] Tri-Factor Signal Aggregation Engine**
    Develop a rules engine that normalizes the technical output scores, corporate action impact scores, and AI sentiment polarity into a unified consensus value between −1.0 and +1.0.

30. **[REQ-304b] Consensus Gauge Visualization Binding**
    Bind the normalized consensus score to the `GaugeWidget` color-coded dial, rendering Buy (green), Sell (red), or Hold (yellow) with the computed value.

Phase 4: Non-Functional Validation Metrics (The Quality Gate)

31. **[REQ-401] UI Thread Responsiveness & Refresh Frame Rate**
    Enforce a strict performance ceiling where the main GUI thread maintains a continuous rendering rate of ≥60 FPS without stutter during heavy background network refreshes.

32. **[REQ-402] High-Volume Graphics Rendering Latency**
    Limit processing and paint pipeline delays to ≤500ms when handling interactive axis scaling or canvas panning over a 365-day historical candlestick dataset.

33. **[REQ-403] Network Fault Tolerance & Graceful Degradation**
    Require the data layer to attempt 3 automated retries upon connection dropouts before displaying a non-blocking offline warning state to the user without crashing.

34. **[REQ-404] Local Data Storage Footprint Constraints**
    Optimize local SQLite operations to ensure the base database configuration file occupies less than 50MB of disk storage under standard continuous use.

35. **[REQ-405] Third-Party API Rate Limit Enforcement**
    Enforce a maximum of 5 outbound API calls per 60-second window to respect yfinance and Gemini fair-use limits, with automatic queuing of excess requests.

36. **[REQ-406] Application Cold-Start Latency Ceiling**
    Verify that the application initializes from process launch to fully interactive UI in under 2.0 seconds on a standard desktop configuration.

37. **[REQ-407] Main-Thread Crash Resilience Under Worker Failure**
    Verify that any exception raised inside a background `DataWorker` thread is caught and logged without crashing or freezing the main PyQt6 event loop.

Phase 5: Production Compliance & Distribution Packaging (The Delivery)

38. **[REQ-501] Statutory Regulatory Disclaimers Display**
    Hardcode visible, prominent SEBI-compliant text banners clarifying that all outputs serve as educational signal indices.

39. **[REQ-502] Universal Runtime Dependency Standalone Package**
    Configure `PyInstaller` compile parameters to bundle cross-platform runtime scripts, local database engines, and visual graphic blocks into a single-file installer.

40. **[REQ-503] Brand Theme Color Enforcement**
    Apply the PRD-specified brand palette (Deep Navy #0A192F, Emerald Green #10B981, Crimson Red #EF4444) consistently across all QSS stylesheets and chart paint contexts.

41. **[REQ-504] Settings Persistence to Local Storage**
    Persist user-modified settings (API key, refresh interval, database path) to a local JSON configuration file and restore them on next application launch.
