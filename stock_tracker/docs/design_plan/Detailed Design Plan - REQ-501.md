**Statutory Regulatory Disclaimers Display**

- **Role**  
    Lead Compliance / Delivery Engineer.
- **Task**  
    Define a statutory disclaimer constant in `config/settings.py` and print it to stdout during application startup in `main.py`.
- **Context**  
    Stock market data applications must display regulatory disclaimers (e.g., SEBI registration status, educational-purpose notice) to comply with Indian securities regulations. The `SEBI_DISCLAIMER` constant contains the exact disclosure text. It is printed to `stdout` inside `main()` after the UI window is shown, ensuring the disclaimer appears in the console log for auditability.
- **Constraints**
    - **Text Constraint:** The constant must be a non-empty string.
    - **Keyword Requirement:** The string must contain the substring `"SEBI"`.
    - **Side Effects:** The disclaimer is written to `stdout` via `print()` — no logging framework, no dialog box.
- **Format**  
    A module-level constant `SEBI_DISCLAIMER` in `config/settings.py`. In `main.py`, after `window.show()`, the line `print(SEBI_DISCLAIMER)` executes.
- **Acceptance Criteria**
    1. **Disclaimer Non-Empty:** `len(SEBI_DISCLAIMER) > 0` (TestREQ501::test_sebi_disclaimer_present).
    2. **Contains SEBI:** The string `"SEBI"` is a substring of `SEBI_DISCLAIMER` (TestREQ501::test_sebi_disclaimer_contains_sebi).
    3. **Printed at Startup:** `print(SEBI_DISCLAIMER)` executes in `main()` after UI initialisation.
- **Module API** (`config/settings.py`)

    | Constant | Type | Value |
    |---|---|---|
    | `SEBI_DISCLAIMER` | `str` | `"Disclaimer: StockTracker Pro is for educational purposes only. Data may be delayed. Not registered with SEBI."` |

---

