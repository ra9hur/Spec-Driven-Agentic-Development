**Brand Theme Color Enforcement**

- **Role**  
    Lead UI/UX Engineer.
- **Task**  
    Define a canonical set of brand colour constants in `config/settings.py` and apply them consistently in the Qt stylesheet (`src/ui/styles.qss`) across all widget types.
- **Context**  
    A consistent dark-theme brand palette is critical for professional appearance. Three primary constants are defined: `COLOR_BULLISH=#10B981` (green for upward price movement), `COLOR_BEARISH=#EF4444` (red for downward movement), and `COLOR_BG_PRIMARY=#0A192F` (deep navy for the main application background). The stylesheet `src/ui/styles.qss` uses `#0A192F` for `QMainWindow` and `QDialog` backgrounds, `#112240` for widget backgrounds (`QTableWidget`, `QLineEdit`), and `#233554` for headers and buttons (`QHeaderView`, `QPushButton`).
- **Constraints**
    - **Exact Hex Values:** The three primary constants must match the PRD exactly: `#10B981`, `#EF4444`, `#0A192F`.
    - **Stylesheet Usage:** The file `src/ui/styles.qss` must contain the string `#0A192F` (the primary background colour).
    - **Consistency Pattern:** Widget backgrounds use `#112240`; headers and buttons use `#233554`; all text is `#CCD6F6`.
- **Format**  
    Colour constants as uppercase module-level `str` variables in `config/settings.py`. The QSS file at `src/ui/styles.qss` references the hex values directly.
- **Acceptance Criteria**
    1. **Brand Constants Match PRD:** `COLOR_BULLISH == "#10B981"`, `COLOR_BEARISH == "#EF4444"`, `COLOR_BG_PRIMARY == "#0A192F"` (TestREQ503::test_brand_colors_match_prd).
    2. **Primary Colour in Stylesheet:** `src/ui/styles.qss` exists and `#0A192F` appears in its content (TestREQ503::test_brand_colors_used_in_styles).
- **Module API** (`config/settings.py`)

    | Constant | Value | Purpose |
    |---|---|---|
    | `COLOR_BULLISH` | `"#10B981"` | Green for upward / bullish price movement |
    | `COLOR_BEARISH` | `"#EF4444"` | Red for downward / bearish price movement |
    | `COLOR_NEUTRAL` | `"#F59E0B"` | Amber for neutral / flat movement |
    | `COLOR_BG_PRIMARY` | `"#0A192F"` | Deep navy main background |
    | `COLOR_BG_SECONDARY` | `"#112240"` | Blue-grey widget background |
    | `COLOR_TEXT_PRIMARY` | `"#CCD6F6"` | Light slate primary text |
    | `COLOR_TEXT_SECONDARY` | `"#8892B0"` | Muted secondary text |

---

