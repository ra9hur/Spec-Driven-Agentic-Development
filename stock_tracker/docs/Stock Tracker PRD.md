
## Product Requirement Document (PRD)

## 1. Document Meta Details

- Header Info:
    
    - Title: Stock Tracker Desktop App for Indian Scrips 
    - Document Owner: Project Product Manager 
    - Status: Draft 
    - Target Release Date: Q3 2026 
    
- Name & Branding:
    
    - Official Name: Indivest Stock Tracker 
    - Code Name: Project Chakra 
    - Branding Guidelines: Deep Navy (#0A192F) primary background, Emerald Green (#10B981) for gains, Crimson Red (#EF4444) for losses, clean sans-serif typography .
    
- Product Summary: An interactive, light-weight Python desktop dashboard built using PyQt6, allowing Indian retail investors to monitor NSE/BSE scrips with automated, near-real-time 15-minute delayed market feeds . The app delivers intelligent actionable insights by combining technical indicators, open exchange announcements, and automated social/news text sentiment analysis using free AI model infrastructures .
- Version History:
    
    - `v1.0.0` (May 14, 2026): Initial draft structuring target deliverables .
    

---

## 2. The "Why": Purpose & Strategy

- Problem Statement: Retail investors tracking Indian equities lack unified desktop tools that blend fluid, high-performance local data graphing with cross-source advice pipelines (technical, official regulatory filings, and news text sentiment analysis) without paying premium pricing tiers for low-latency market web interfaces .
- Goals & Objectives:
    
    - Performance: Maintain continuous UI responsiveness at 60 FPS during intensive auto-refreshes using dedicated multi-threaded worker loops.
    - Utility: Achieve less than 500ms local visual latency for deep interactive pan and zoom actions across multi-day stock price timelines.
    
- Target Audience: Indian active swing traders, technical analysis hobbyists, and value investors tracking BSE/NSE listings .

---

## 3. The "What": Requirements & Features

- User Stories:
    
    - _Story 1:_ As an Indian market investor, I want to add NSE stock tokens (e.g., `RELIANCE.NS`) to a locally stored watchlist, so that I can immediately view their metrics every time I launch my app .
    - _Story 2:_ As a technical chartist, I want fluid panning, zooming, and crosshair tools on candle layouts, so that I can easily spot key support and resistance clusters without lagging the UI .
    - _Story 3:_ As an active buyer, I want a combined recommendation gauge showing automated technical models, raw exchange actions, and AI sentiment scores, so that I can cross-verify trading signals .
    
- Functional Requirements:
    
    - Watchlist Core Engine: Allows standard CRUD operations (Create, Read, Update, Delete) to organize local stock ticker portfolios.
    - Auto-Refreshing Threaded Polling: Asynchronous polling of market data layers running on a isolated backdrop loop, fetching updated fields exactly every 60 seconds with an expected ~15-minute downstream provider delay.
    - Interactive Graphics Engine: Dual-axis canvas capable of rendering discrete candlestick arrays, volume bars, and overlay charts with zero UI lockup.
    - Tri-Factor Intelligence Pipeline: Comprehensive inference calculation block delivering structural analytics:
        
        - _Technical Indicator Processor:_ Calculated locally via mathematical definitions (Simple Moving Averages, RSI-14, MACD).
        - _Exchange Feed Scanner:_ Regex filtering of corporate action string summaries gathered from exchange aggregators.
        - _AI Sentiment Engine:_ Direct API integration querying recent financial text against free tiers to return a normalized polarity score.
        
    
- User Flows & Design:
    
    - The app initializes into a split layout: left side houses the active SQLite-driven watchlist grid; right side loads the interactive historical plot powered by PyQTGraph or QWebEngineView-wrapped Plotly components . A dedicated lower drawer panel renders the explicit consensus recommendations and recent data-source tables .
    
- Non-Functional Requirements:
    
    - Data Isolation: All portfolio structures and caching configuration data must be managed entirely in a zero-dependency local filesystem schema.
    - Strict UI Decoupling: Heavy I/O processing operations must be managed on sub-threads to ensure main-loop execution times stay below 16.6ms per frame.
    

---

## 4. Constraints & Scope

- Scope & Out of Scope:
    
    - _In Scope:_ Automated tracking layouts, 15-minute delayed REST/Scraping data fetching layers, basic technical indicator calculations, and text-sentiment scoring pipelines .
    - _Out of Scope:_ Live instant order routing to Indian stock brokers, automated algo-trading transaction loops, multi-device cloud portfolio synchronization engines, and paid low-latency socket configurations.
    
- Assumptions & Dependencies:
    
    - Assumes public upstream wrappers (e.g., `yfinance`) maintain reliable access parsing parameters for `.NS` / `.BO` Indian exchange tickers.
    - Assumes the user's desktop client has active broadband connectivity during operating window runtimes to make outbound API connections.
    
- Legal & Compliance:
    
    - SEBI Compliance Indicator: The system must feature explicit text notices highlighting that all calculated signals represent automated rule-based summaries rather than certified investment advisory positions.
    - Terms of Service Adherence: Data scraping rules must respect fair-use bounds and rate-limit constraints specified by third-party data providers.
    
- Risks: Upstream endpoints changing structural JSON payloads could temporarily disrupt the data pipelines, requiring robust validation and graceful fallback blocks.

---

## 5. Success & Rollout

- Success Metrics (KPIs):
    
    - Zero main-thread application crashes across prolonged multi-hour tracking sessions during market windows (p. 2).
    - Initialization to visual runtime load speeds under 2.0 seconds flat across standard desktop setups (p. 2).
    
- Release Criteria:
    
    - 100% test coverage validating that asynchronous worker failures do not crash the primary window container UI loop (p. 2).
    - Verified parsing accuracy matching localized calculations against live NSE/BSE delayed market reference values (p. 2).
    
- Timeline & Milestones:
    
    - _Phase 1 (Weeks 1-2):_ Setup local relational persistence schemas and build the primary layout containers using PyQt6.
    - _Phase 2 (Weeks 3-4):_ Implement the multi-threaded data polling engine and configure the responsive graphing canvases.
    - _Phase 3 (Weeks 5-6):_ Connect the free AI sentiment scripts and integrate the technical indicator processing modules.
    - _Phase 4 (Week 7):_ Execute deployment packaging configurations across standard target desktop platforms.
    

---

## 6. Target Implementation Stack Architecture

| Component                   | Selected Technology                  | Operational Details & Rationale                                                                                                    |
| --------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| GUI Layout Base             | `PyQt6`                              | Delivers high-performance, native C++ desktop rendering speeds, far exceeding Tkinter under heavy visualization loads.             |
| Market Data Pipeline        | `yfinance` / `Alpha Vantage`         | Provides free EOD and 15-minute delayed data parsing for Indian listings (`.NS` and `.BO` suffixes) without premium subscriptions. |
| Interactive Graphing Canvas | `pyqtgraph`                          | Achieves extreme frames-per-second scrolling and zooming capabilities by leveraging direct hardware acceleration.                  |
| Relational Storage Engine   | `SQLite`                             | Zero-configuration file database built natively into the Python runtime for saving watchlists and configurations.                  |
| AI Inference Module         | Google Gemini API via `google-genai` | Free-tier keys from Google AI Studio offer generous text sentiment requests per minute without requiring credit cards.             |
| Local Calculations          | `pandas` + `ta-lib` / `pandas-ta`    | High-efficiency vectorized matrix libraries to compute moving averages and RSI markers without blocking threads.                   |
| Desktop Deployment Builder  | `PyInstaller`                        | Bundles the complete workspace, assets, and Python runtime dependencies into a single standalone installer package.                |
