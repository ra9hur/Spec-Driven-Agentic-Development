import os
import pytest

from config.settings import (
    SEBI_DISCLAIMER,
    COLOR_BULLISH, COLOR_BEARISH, COLOR_NEUTRAL,
    COLOR_BG_PRIMARY, COLOR_BG_SECONDARY,
    COLOR_TEXT_PRIMARY, COLOR_TEXT_SECONDARY,
)
from config.database import save_pref, load_pref, init_db


# ---------------------------------------------------------------------------
# REQ-501  Statutory Regulatory Disclaimers Display
# ---------------------------------------------------------------------------
class TestREQ501:
    """SEBI disclaimer constant and startup-printing compliance."""

    def test_sebi_disclaimer_present(self):
        """AC1: Disclaimer constant is a non-empty string."""
        assert len(SEBI_DISCLAIMER) > 0

    def test_sebi_disclaimer_contains_sebi(self):
        """AC2: The string 'SEBI' is a substring of SEBI_DISCLAIMER."""
        assert "SEBI" in SEBI_DISCLAIMER

    def test_sebi_disclaimer_is_string(self):
        """Edge: SEBI_DISCLAIMER is a string instance."""
        assert isinstance(SEBI_DISCLAIMER, str)

    def test_sebi_disclaimer_starts_with_disclaimer_label(self):
        """Edge: Disclaimer begins with 'Disclaimer:' for compliance formatting."""
        assert SEBI_DISCLAIMER.startswith("Disclaimer:")

    def test_sebi_disclaimer_contains_educational_purpose(self):
        """Edge: Disclaimer mentions educational purpose."""
        assert "educational" in SEBI_DISCLAIMER

    def test_sebi_disclaimer_printed_in_main(self):
        """AC3: main.py contains print(SEBI_DISCLAIMER) after window.show()."""
        main_path = os.path.join(os.path.dirname(__file__), "..", "main.py")
        with open(main_path) as f:
            content = f.read()
        assert "print(SEBI_DISCLAIMER)" in content
        # Verify it comes after window.show()
        show_pos = content.index("window.show()")
        print_pos = content.index("print(SEBI_DISCLAIMER)")
        assert print_pos > show_pos, "print() must appear after window.show()"

    def test_sebi_disclaimer_imported_in_main(self):
        """Edge: SEBI_DISCLAIMER is imported in main.py."""
        main_path = os.path.join(os.path.dirname(__file__), "..", "main.py")
        with open(main_path) as f:
            content = f.read()
        assert "from config.settings import" in content
        assert "SEBI_DISCLAIMER" in content


# ---------------------------------------------------------------------------
# REQ-502  Universal Runtime Dependency Standalone Package
# ---------------------------------------------------------------------------
class TestREQ502:
    """Build installer script for PyInstaller packaging."""

    def test_build_script_exists(self):
        """AC1: build_installer.py exists at the project root."""
        assert os.path.exists("build_installer.py")

    def test_build_script_has_build_function(self):
        """Edge: build_installer.py defines a build() function."""
        with open("build_installer.py") as f:
            content = f.read()
        assert "def build()" in content

    def test_build_script_has_main_guard(self):
        """Edge: build_installer.py has if __name__ == '__main__' guard."""
        with open("build_installer.py") as f:
            content = f.read()
        assert '__name__ == "__main__"' in content or "__name__ == '__main__'" in content

    def test_build_uses_onefile_flag(self):
        """Edge: Build script passes --onefile to PyInstaller."""
        with open("build_installer.py") as f:
            content = f.read()
        assert "--onefile" in content

    def test_build_uses_windowed_flag(self):
        """Edge: Build script passes --windowed to PyInstaller."""
        with open("build_installer.py") as f:
            content = f.read()
        assert "--windowed" in content

    def test_build_adds_stylesheet_data(self):
        """Edge: Build script adds styles.qss via --add-data."""
        with open("build_installer.py") as f:
            content = f.read()
        assert "--add-data" in content
        assert "styles.qss" in content

    def test_build_uses_os_pathsep(self):
        """Edge: Build script uses os.pathsep for platform-independent paths."""
        with open("build_installer.py") as f:
            content = f.read()
        assert "os.pathsep" in content

    def test_build_checks_icon_file(self):
        """Edge: Build script conditionally includes icon.ico when present."""
        with open("build_installer.py") as f:
            content = f.read()
        assert "icon.ico" in content
        assert "os.path.exists" in content

    def test_build_exits_on_failure(self):
        """Edge: Build script calls sys.exit on non-zero return code."""
        with open("build_installer.py") as f:
            content = f.read()
        assert "sys.exit(result.returncode)" in content

    def test_build_uses_subprocess_run(self):
        """Edge: Build script uses subprocess.run (not Popen or manual exec)."""
        with open("build_installer.py") as f:
            content = f.read()
        assert "subprocess.run" in content


# ---------------------------------------------------------------------------
# REQ-503  Brand Theme Color Enforcement
# ---------------------------------------------------------------------------
class TestREQ503:
    """Brand colour constants in settings.py and usage in styles.qss."""

    PRIMARY_COLORS = {
        "COLOR_BULLISH": "#10B981",
        "COLOR_BEARISH": "#EF4444",
        "COLOR_BG_PRIMARY": "#0A192F",
    }

    ALL_COLORS = {
        "COLOR_BULLISH": "#10B981",
        "COLOR_BEARISH": "#EF4444",
        "COLOR_NEUTRAL": "#F59E0B",
        "COLOR_BG_PRIMARY": "#0A192F",
        "COLOR_BG_SECONDARY": "#112240",
        "COLOR_TEXT_PRIMARY": "#CCD6F6",
        "COLOR_TEXT_SECONDARY": "#8892B0",
    }

    def test_brand_colors_match_prd(self):
        """AC1: Three primary brand constants match the exact PRD hex values."""
        assert COLOR_BULLISH == "#10B981"
        assert COLOR_BEARISH == "#EF4444"
        assert COLOR_BG_PRIMARY == "#0A192F"

    def test_brand_colors_used_in_styles(self):
        """AC2: Primary background #0A192F appears in styles.qss."""
        qss_path = os.path.join("src", "ui", "styles.qss")
        assert os.path.exists(qss_path)
        with open(qss_path) as f:
            content = f.read()
        assert "#0A192F" in content

    def test_all_brand_constants_exist(self):
        """Edge: All 7 brand colour constants are defined and non-empty strings."""
        for name, expected in self.ALL_COLORS.items():
            actual = globals().get(name)
            assert actual is not None, f"{name} is not imported"
            assert isinstance(actual, str), f"{name} is not a string"
            assert len(actual) > 0, f"{name} is empty"

    def test_all_brand_constants_hex_format(self):
        """Edge: All brand colour constants start with # and are valid hex."""
        for name, expected in self.ALL_COLORS.items():
            actual = globals().get(name)
            assert actual.startswith("#"), f"{name} does not start with #"
            assert len(actual) == 7, f"{name} is not 7 chars (got {len(actual)})"
            int(actual[1:], 16)  # raises ValueError if invalid hex

    def test_all_brand_constants_match_expected_values(self):
        """Edge: All 7 brand colour constants match their expected values."""
        for name, expected in self.ALL_COLORS.items():
            assert globals()[name] == expected, f"{name} expected {expected} got {globals()[name]}"

    def test_secondary_bg_in_stylesheet(self):
        """Edge: #112240 (COLOR_BG_SECONDARY) appears in styles.qss."""
        qss_path = os.path.join("src", "ui", "styles.qss")
        with open(qss_path) as f:
            content = f.read()
        assert "#112240" in content

    def test_text_primary_in_stylesheet(self):
        """Edge: #CCD6F6 (COLOR_TEXT_PRIMARY) appears in styles.qss."""
        qss_path = os.path.join("src", "ui", "styles.qss")
        with open(qss_path) as f:
            content = f.read()
        assert "#CCD6F6" in content

    def test_header_button_bg_in_stylesheet(self):
        """Edge: #233554 appears in styles.qss for headers and buttons."""
        qss_path = os.path.join("src", "ui", "styles.qss")
        with open(qss_path) as f:
            content = f.read()
        assert "#233554" in content

    def test_stylesheet_file_exists(self):
        """Edge: src/ui/styles.qss file exists on disk."""
        qss_path = os.path.join("src", "ui", "styles.qss")
        assert os.path.exists(qss_path)


# ---------------------------------------------------------------------------
# REQ-504  Settings Persistence to Local Storage
# ---------------------------------------------------------------------------
class TestREQ504:
    """SettingsModal persistence layer via layout_prefs table."""

    def test_settings_persist_and_restore(self):
        """AC1: save_pref + load_pref round-trips match."""
        init_db()
        save_pref("gemini_api_key", "test-key-123")
        save_pref("refresh_interval", "90")
        assert load_pref("gemini_api_key") == "test-key-123"
        assert load_pref("refresh_interval") == "90"

    def test_settings_modal_loads_persisted_values(self, qtbot):
        """AC2: SettingsModal shows previously saved values."""
        init_db()
        save_pref("gemini_api_key", "persisted-key")
        save_pref("refresh_interval", "120")
        from src.ui.screens.settings_mod import SettingsModal
        modal = SettingsModal()
        qtbot.addWidget(modal)
        assert modal.api_key_input.text() == "persisted-key"
        assert modal.refresh_interval.value() == 120

    def test_default_interval_when_not_persisted(self, qtbot):
        """AC3: Default refresh interval is 60 when nothing is persisted."""
        from src.ui.screens.settings_mod import SettingsModal
        modal = SettingsModal()
        qtbot.addWidget(modal)
        assert modal.refresh_interval.value() == 60

    def test_get_settings_returns_correct_dict(self, qtbot):
        """Edge: get_settings() returns the expected API key and interval."""
        from src.ui.screens.settings_mod import SettingsModal
        modal = SettingsModal()
        qtbot.addWidget(modal)
        modal.api_key_input.setText("test-key")
        modal.refresh_interval.setValue(45)
        settings = modal.get_settings()
        assert settings == {"api_key": "test-key", "refresh_interval": 45}

    def test_on_accept_saves_settings(self, qtbot):
        """Edge: _on_accept writes current widget values to the DB."""
        from src.ui.screens.settings_mod import SettingsModal
        init_db()
        modal = SettingsModal()
        qtbot.addWidget(modal)
        modal.api_key_input.setText("saved-key")
        modal.refresh_interval.setValue(75)
        modal._on_accept()
        assert load_pref("gemini_api_key") == "saved-key"
        assert load_pref("refresh_interval") == "75"

    def test_empty_api_key_persisted(self):
        """Edge: Empty API key is persisted and restored correctly."""
        init_db()
        save_pref("gemini_api_key", "")
        assert load_pref("gemini_api_key") == ""

    def test_overwrite_existing_pref(self):
        """Edge: save_pref overwrites an existing value."""
        init_db()
        save_pref("gemini_api_key", "first-value")
        save_pref("gemini_api_key", "second-value")
        assert load_pref("gemini_api_key") == "second-value"

    def test_interval_boundary_minimum(self, qtbot):
        """Edge: SpinBox minimum interval 5 is accepted and persisted."""
        from src.ui.screens.settings_mod import SettingsModal
        init_db()
        modal = SettingsModal()
        qtbot.addWidget(modal)
        modal.refresh_interval.setValue(5)
        modal._on_accept()
        assert load_pref("refresh_interval") == "5"

    def test_interval_boundary_maximum(self, qtbot):
        """Edge: SpinBox maximum interval 300 is accepted and persisted."""
        from src.ui.screens.settings_mod import SettingsModal
        init_db()
        modal = SettingsModal()
        qtbot.addWidget(modal)
        modal.refresh_interval.setValue(300)
        modal._on_accept()
        assert load_pref("refresh_interval") == "300"

    def test_load_pref_nonexistent_returns_default(self):
        """Edge: load_pref with nonexistent key returns the default value."""
        init_db()
        assert load_pref("nonexistent_key") == ""
        assert load_pref("nonexistent_key", "default_val") == "default_val"

    def test_load_pref_nonexistent_returns_empty_string(self):
        """Edge: load_pref with nonexistent key returns empty string by default."""
        init_db()
        assert load_pref("nonexistent_key") == ""

    def test_settings_modal_is_modal(self, qtbot):
        """Edge: SettingsModal is a modal dialog."""
        from src.ui.screens.settings_mod import SettingsModal
        modal = SettingsModal()
        qtbot.addWidget(modal)
        assert modal.isModal()

    def test_settings_modal_window_title(self, qtbot):
        """Edge: SettingsModal has the correct window title."""
        from src.ui.screens.settings_mod import SettingsModal
        modal = SettingsModal()
        qtbot.addWidget(modal)
        assert modal.windowTitle() == "Settings"

    def test_settings_modal_has_form_elements(self, qtbot):
        """Edge: SettingsModal has API key input and refresh interval spinbox."""
        from src.ui.screens.settings_mod import SettingsModal
        modal = SettingsModal()
        qtbot.addWidget(modal)
        assert hasattr(modal, "api_key_input")
        assert hasattr(modal, "refresh_interval")

    def test_save_pref_special_characters(self):
        """Edge: save_pref handles special characters in the value."""
        init_db()
        special = "key-with-special_chars@#$%"
        save_pref("special_key", special)
        assert load_pref("special_key") == special

    def test_save_load_multiple_keys(self):
        """Edge: Multiple independent keys can be saved and loaded."""
        init_db()
        for i in range(5):
            save_pref(f"key_{i}", f"value_{i}")
        for i in range(5):
            assert load_pref(f"key_{i}") == f"value_{i}"
