from PyQt6.QtCore import Qt
from PyQt6.QtGui import QPainter, QColor, QFont
from PyQt6.QtWidgets import QWidget

from config.settings import COLOR_BULLISH, COLOR_BEARISH, COLOR_NEUTRAL


class Gauge(QWidget):
    def __init__(self, parent=None) -> None:
        super().__init__(parent)
        self._score: float = 0.0
        self._label: str = "NEUTRAL"
        self._detail: str = ""
        self.setMinimumSize(120, 120)

    def set_value(self, score: float, label: str) -> None:
        self._score = max(-1.0, min(1.0, score))
        self._label = label.upper()
        self.update()

    def set_consensus(self, score: float, detail: str = "") -> None:
        label = "BULLISH" if score > 0.2 else ("BEARISH" if score < -0.2 else "NEUTRAL")
        self._score = max(-1.0, min(1.0, score))
        self._label = label
        self._detail = detail
        self.update()

    def paintEvent(self, event) -> None:
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)

        w = self.width()
        h = self.height()
        cx, cy = w // 2, h // 2
        radius = min(w, h) // 2 - 10

        color = QColor(COLOR_NEUTRAL)
        if self._label == "BULLISH":
            color = QColor(COLOR_BULLISH)
        elif self._label == "BEARISH":
            color = QColor(COLOR_BEARISH)

        painter.setPen(Qt.PenStyle.NoPen)
        painter.setBrush(color)
        painter.drawEllipse(cx - radius, cy - radius, radius * 2, radius * 2)

        painter.setPen(QColor("#CCD6F6"))
        font = QFont("Segoe UI", 14, QFont.Weight.Bold)
        painter.setFont(font)
        painter.drawText(self.rect(), Qt.AlignmentFlag.AlignCenter, self._label)
