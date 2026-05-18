import json
import os

from PyQt6.QtWidgets import (
    QDialog,
    QFormLayout,
    QLineEdit,
    QSpinBox,
    QDialogButtonBox,
)

from config.database import save_pref, load_pref

CONFIG_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
    "data",
    "settings.json",
)


class SettingsModal(QDialog):
    def __init__(self, parent=None) -> None:
        super().__init__(parent)
        self.setWindowTitle("Settings")
        self.setModal(True)
        self.resize(400, 250)

        self.api_key_input = QLineEdit()
        self.api_key_input.setEchoMode(QLineEdit.EchoMode.Password)
        self.refresh_interval = QSpinBox()
        self.refresh_interval.setRange(5, 300)
        self.refresh_interval.setValue(60)

        self._load_settings()

        layout = QFormLayout(self)
        layout.addRow("Gemini API Key:", self.api_key_input)
        layout.addRow("Refresh interval (s):", self.refresh_interval)

        buttons = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel
        )
        buttons.accepted.connect(self._on_accept)
        buttons.rejected.connect(self.reject)
        layout.addRow(buttons)

    def _load_settings(self) -> None:
        api_key = load_pref("gemini_api_key")
        interval = load_pref("refresh_interval", "60")
        if api_key:
            self.api_key_input.setText(api_key)
        try:
            self.refresh_interval.setValue(int(interval))
        except ValueError:
            pass

    def _on_accept(self) -> None:
        save_pref("gemini_api_key", self.api_key_input.text())
        save_pref("refresh_interval", str(self.refresh_interval.value()))
        self.accept()

    def get_settings(self) -> dict:
        return {
            "api_key": self.api_key_input.text(),
            "refresh_interval": self.refresh_interval.value(),
        }
