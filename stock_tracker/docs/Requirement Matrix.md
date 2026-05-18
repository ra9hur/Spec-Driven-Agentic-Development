
Here is your comprehensive **Traceability Matrix**. ==This document maps the strategic sections of the **PRD** directly to the **41 numbered technical requirements**== and points to the specific file in project folder where that logic must be implemented and tested.

This structural mapping ensures that no feature from your product blueprint is missed during development or verification.

| PRD Section Reference | Technical Req ID | Requirement Functional Name | Target Code Artifact Path | Target Test Script Validation |
|---|---|---|---|---|
| **3. Functional (Watchlist Engine)** | `[REQ-101]` | Local Storage Initialization | `config/database.py` | `tests/test_phase1_shell.py` |
| **3. User Stories (Story 1 - NSE/BSE)** | `[REQ-102]` | Ticker Validation Framework | `config/settings.py` | `tests/test_phase1_shell.py` |
| **3. Functional (Watchlist Engine)** | `[REQ-103a]` | Watchlist Data Management — Add Ticker | `config/database.py` | `tests/test_phase1_shell.py` |
| **3. Functional (Watchlist Engine)** | `[REQ-103b]` | Watchlist Data Management — List Tickers | `config/database.py` | `tests/test_phase1_shell.py` |
| **3. Functional (Watchlist Engine)** | `[REQ-103c]` | Watchlist Data Management — Update Ticker | `config/database.py` | `tests/test_phase1_shell.py` |
| **3. Functional (Watchlist Engine)** | `[REQ-103d]` | Watchlist Data Management — Remove Ticker | `config/database.py` | `tests/test_phase1_shell.py` |
| **3. User Flows & Design (Layout)** | `[REQ-104]` | Native GUI Main Window Shell | `src/ui/screens/main_window.py` | `tests/test_phase1_shell.py` |
| **3. User Flows & Design (Sidebar)** | `[REQ-105]` | Watchlist Navigation Sidebar UI | `src/ui/components/watchlist.py` | `tests/test_phase1_shell.py` |
| **3. User Flows & Design (Viewport)** | `[REQ-106]` | Main Charting Dashboard UI | `src/ui/components/chart.py` | `tests/test_phase1_shell.py` |
| **3. User Flows & Design (Drawer)** | `[REQ-107]` | Recommendation Insights Panel UI | `src/ui/components/gauge.py` | `tests/test_phase1_shell.py` |
| **3. Functional / UI Layout (Modals)** | `[REQ-108]` | Global Settings Window UI | `src/ui/screens/settings_mod.py` | `tests/test_phase1_shell.py` |
| **3. User Stories (Story 1 - Input)** | `[REQ-109]` | Ticker Search Submission Input Bar | `src/ui/components/watchlist.py` | `tests/test_phase1_shell.py` |
| **3. User Flows & Design (Drawer)** | `[REQ-110]` | Lower Collapsible Recommendation Drawer | `src/ui/screens/main_window.py` | `tests/test_phase1_shell.py` |
| **3. Functional (Watchlist Engine)** | `[REQ-111]` | Watchlist Auto-Restore on Launch | `src/ui/screens/main_window.py` | `tests/test_phase1_shell.py` |
| **3. Non-Functional (Strict Decoupling)** | `[REQ-201]` | Multi-Threaded Worker (`QThread`) | `src/workers/data_worker.py` | `tests/test_phase2_wiring.py` |
| **3. Functional (Threaded Polling)** | `[REQ-202]` | Delayed REST Market Pipeline | `src/workers/data_worker.py` | `tests/test_phase2_wiring.py` |
| **3. Functional (Threaded Polling)** | `[REQ-203]` | Automated Refresh Loop Timer | `src/workers/data_worker.py` | `tests/test_phase2_wiring.py` |
| **3. Functional (Interactive Graphics)** | `[REQ-204a]` | pyqtgraph Viewport Embedding | `src/ui/components/chart.py` | `tests/test_phase2_wiring.py` |
| **3. Functional (Interactive Graphics)** | `[REQ-204b]` | Candlestick & Volume Bar Rendering | `src/ui/components/chart.py` | `tests/test_phase2_wiring.py` |
| **2. Goals (Utility Latency targets)** | `[REQ-205]` | Continuous Interactivity Control | `src/ui/components/chart.py` | `tests/test_phase2_wiring.py` |
| **3. Functional (Interactive Graphics)** | `[REQ-206]` | Volume Bar Histogram Rendering | `src/ui/components/chart.py` | `tests/test_phase2_wiring.py` |
| **3. Functional (Interactive Graphics)** | `[REQ-207]` | Chart Crosshair Tracking Labels | `src/ui/components/chart.py` | `tests/test_phase2_wiring.py` |
| **3. Functional (Interactive Graphics)** | `[REQ-208]` | Interval/Period Configuration Toggles | `src/ui/components/chart.py` | `tests/test_phase2_wiring.py` |
| **3. Functional (Technical Indicator)** | `[REQ-301a]` | Simple Moving Average (SMA) Calculation | `src/engines/technical.py` | `tests/test_phase3_intelligence.py` |
| **3. Functional (Technical Indicator)** | `[REQ-301b]` | RSI-14 Calculation | `src/engines/technical.py` | `tests/test_phase3_intelligence.py` |
| **3. Functional (Technical Indicator)** | `[REQ-301c]` | MACD Calculation | `src/engines/technical.py` | `tests/test_phase3_intelligence.py` |
| **3. Functional (Exchange Feed Scanner)** | `[REQ-302]` | Corporate Actions Text Extractor | `src/engines/corporate.py` | `tests/test_phase3_intelligence.py` |
| **3. Functional (AI Sentiment Engine)** | `[REQ-303]` | Zero-Cost AI Sentiment Pipeline | `src/engines/sentiment.py` | `tests/test_phase3_intelligence.py` |
| **3. Functional (Tri-Factor Pipeline)** | `[REQ-304a]` | Signal Aggregation Engine | `src/engines/technical.py` | `tests/test_phase3_intelligence.py` |
| **3. Functional (Tri-Factor Pipeline)** | `[REQ-304b]` | Consensus Gauge Visualization Binding | `src/ui/components/gauge.py` | `tests/test_phase3_intelligence.py` |
| **3. Non-Functional (Frame Rates)** | `[REQ-401]` | UI Thread Responsiveness Guard | `src/ui/components/chart.py` | `tests/test_phase4_nfr_gates.py` |
| **3. Non-Functional (Paint Delays)** | `[REQ-402]` | Graphics Paint Latency Limit | `src/ui/components/chart.py` | `tests/test_phase4_nfr_gates.py` |
| **4. Risks (Upstream Endpoint Faults)** | `[REQ-403]` | Network Fault Tolerance Engine | `src/workers/data_worker.py` | `tests/test_phase4_nfr_gates.py` |
| **3. Non-Functional (Data Isolation)** | `[REQ-404]` | Local Storage Footprint Limit | `config/database.py` | `tests/test_phase4_nfr_gates.py` |
| **4. Constraints (Rate Limits)** | `[REQ-405]` | Third-Party API Rate Limit Enforcement | `src/workers/data_worker.py` | `tests/test_phase4_nfr_gates.py` |
| **5. Success Metrics (KPIs)** | `[REQ-406]` | Cold-Start Latency Ceiling | `main.py` | `tests/test_phase4_nfr_gates.py` |
| **5. Success Metrics (KPIs)** | `[REQ-407]` | Main-Thread Crash Resilience | `src/workers/data_worker.py` | `tests/test_phase4_nfr_gates.py` |
| **4. Legal & Compliance (SEBI rules)** | `[REQ-501]` | Statutory Regulatory Disclaimer | `src/ui/components/gauge.py` | `tests/test_phase5_delivery.py` |
| **5. Timeline & Milestones (Phase 4)** | `[REQ-502]` | Runtime Dependency Packaging | `build_installer.py` | `tests/test_phase5_delivery.py` |
| **1. Branding Guidelines** | `[REQ-503]` | Brand Theme Color Enforcement | `config/settings.py`, `src/ui/styles.qss` | `tests/test_phase5_delivery.py` |
| **3. Functional / UI Layout (Modals)** | `[REQ-504]` | Settings Persistence to Local Storage | `src/ui/screens/settings_mod.py` | `tests/test_phase5_delivery.py` |
