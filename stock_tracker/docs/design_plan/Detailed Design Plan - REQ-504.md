**Settings Persistence to Local Storage**

- **Role**  
    Lead UI/Frontend Engineer.
- **Task**  
    Implement a `SettingsModal` (`QDialog`) in `src/ui/screens/settings_mod.py` that reads and writes `gemini_api_key` and `refresh_interval` to the `layout_prefs` table via `save_pref` / `load_pref`.
- **Context**  
    User preferences must survive application restarts. The `SettingsModal` dialog loads persisted values from the database on construction via `_load_settings()`, and writes them back on accept via `_on_accept()`. The `get_settings()` convenience method returns a `dict` of current widget values for downstream consumption by workers and the UI refresh timer.
- **Constraints**
    - **Persistence Layer:** All reads/writes go through `config.database.save_pref(key, value)` and `config.database.load_pref(key, default="")`, which use the `layout_prefs` table with upsert semantics.
    - **Key Names:** Two preference keys are used: `"gemini_api_key"` (stored as plain text, masked in UI via `EchoMode.Password`) and `"refresh_interval"` (stored as string, displayed via `QSpinBox` with range 5–300).
    - **No Encryption:** The API key is persisted in plain text; encryption is a future enhancement.
    - **Modal Behaviour:** `setModal(True)` blocks interaction with the parent window until the dialog is accepted or rejected.
- **Format**  
    `SettingsModal(QDialog)` class in `src/ui/screens/settings_mod.py`. Layout uses `QFormLayout` with `QLineEdit` (password-masked) + `QSpinBox` + `QDialogButtonBox(Ok|Cancel)`.
- **Acceptance Criteria**
    1. **Persist and Restore:** After `save_pref("gemini_api_key", "test-key-123")` and `save_pref("refresh_interval", "90")`, calling `load_pref` returns the exact same values (TestREQ504::test_settings_persist_and_restore).
    2. **Modal Loads Persisted Values:** After saving `"persisted-key"` / `"120"`, constructing a new `SettingsModal` shows those values in `api_key_input.text()` and `refresh_interval.value()` (TestREQ504::test_settings_modal_loads_persisted_values).
    3. **Default Interval:** If no `refresh_interval` is persisted, the spin box defaults to `60`.
- **Module API** (`src/ui/screens/settings_mod.py`)

    | Method | Signature | Returns | Notes |
    |---|---|---|---|
    | `SettingsModal.__init__` | `(parent=None) -> None` | `None` | Sets up form; calls `_load_settings()` |
    | `SettingsModal._load_settings` | `() -> None` | `None` | Reads `gemini_api_key` and `refresh_interval` from DB via `load_pref` |
    | `SettingsModal._on_accept` | `() -> None` | `None` | Writes current widget values to DB via `save_pref`; calls `self.accept()` |
    | `SettingsModal.get_settings` | `() -> dict` | `dict` | Returns `{"api_key": str, "refresh_interval": int}` |

---

