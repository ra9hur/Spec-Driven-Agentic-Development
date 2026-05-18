**Global Settings Window UI**

- **Role**  
    Lead UI/Frontend Engineer.
- **Task**  
    Build the `SettingsModal(QDialog)` — a modal dialog that allows the user to configure the Gemini API key and the data refresh interval, persisting values to the `layout_prefs` table.
- **Context**  
    The `SettingsModal` in `src/ui/screens/settings_mod.py` is a 400×250 pixel modal dialog launched from the main window. It presents a `QFormLayout` with two fields: a `QLineEdit` for the Gemini API key (password-masked via `Password` echo mode) and a `QSpinBox` for the refresh interval (range 5–300 seconds, default 60). On accept, values are saved via `save_pref()` and the dialog closes. On cancel, changes are discarded. Settings are restored on open via `load_pref()` with a fallback default of `"60"` for the interval.
- **Constraints**
    - **Window Geometry:** `resize(400, 250)` with `setModal(True)`.
    - **API Key Field:** `QLineEdit` with `EchoMode.Password` to mask input.
    - **Interval Field:** `QSpinBox` with range `5` to `300` inclusive, initial value `60`.
    - **Persistence Strategy:** Uses `save_pref()` / `load_pref()` from `config.database` which round-trip through the `layout_prefs` table (`INSERT OR REPLACE`).
- **Format**  
    A single `SettingsModal(QDialog)` class in `src/ui/screens/settings_mod.py`. Layout uses `QFormLayout`. Button box uses `QDialogButtonBox` with `Ok | Cancel` standard buttons.
- **Acceptance Criteria** (mapped to TestREQ108 in `tests/test_phase1_shell.py`)
    1. `test_settings_modal_module_importable` — module imports successfully and has `SettingsModal`.
