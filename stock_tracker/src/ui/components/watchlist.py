import re
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtWidgets import (
    QTableWidget, QTableWidgetItem, QHeaderView,
    QHBoxLayout, QVBoxLayout, QLineEdit, QPushButton, QWidget,
)
from config.settings import COLOR_BULLISH, COLOR_BEARISH
from config.database import add_watchlist_symbol, list_watchlist_symbols, remove_watchlist_symbol


def parse_color(hex_color: str):
    from PyQt6.QtGui import QColor
    return QColor(hex_color)


_SYMBOL_RE = re.compile(r"^[A-Z0-9]+\.(NS|BO)$", re.IGNORECASE)


class Watchlist(QWidget):
    symbol_submitted = pyqtSignal(str)
    symbol_selected = pyqtSignal(str)

    COLUMNS = ["Symbol", "Price", "Change %", "RSI", "Signal"]

    def __init__(self, parent=None) -> None:
        super().__init__(parent)
        self._table = QTableWidget()
        self._table.setColumnCount(len(self.COLUMNS))
        self._table.setHorizontalHeaderLabels(self.COLUMNS)
        self._table.horizontalHeader().setStretchLastSection(True)
        self._table.horizontalHeader().setSectionResizeMode(
            QHeaderView.ResizeMode.Stretch
        )
        self._table.verticalHeader().setVisible(False)
        self._table.setEditTriggers(QTableWidget.EditTrigger.NoEditTriggers)
        self._table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        self._table.itemDoubleClicked.connect(self._on_symbol_clicked)

        self._search_input = QLineEdit()
        self._search_input.setPlaceholderText("Enter symbol (e.g. RELIANCE.NS)")
        self._search_input.returnPressed.connect(self._submit_symbol)

        self._add_btn = QPushButton("Add")
        self._add_btn.clicked.connect(self._submit_symbol)

        self._delete_btn = QPushButton("Delete")
        self._delete_btn.clicked.connect(self._delete_selected)
        self._delete_btn.setEnabled(False)

        self._table.itemSelectionChanged.connect(self._on_selection_changed)

        btn_row = QHBoxLayout()
        btn_row.addWidget(self._add_btn)
        btn_row.addWidget(self._delete_btn)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.addWidget(self._search_input)
        layout.addLayout(btn_row)
        layout.addWidget(self._table)

    def _submit_symbol(self) -> None:
        raw = self._search_input.text().strip().upper()
        if not _SYMBOL_RE.match(raw):
            msg = f"Invalid format. Use SYMBOL.NS or SYMBOL.BO (e.g. RELIANCE.NS)"
            win = self.window()
            if win and hasattr(win, "statusBar"):
                win.statusBar().showMessage(msg, 5000)
            return
        if not add_watchlist_symbol(raw):
            msg = f"{raw} is already in the watchlist"
            win = self.window()
            if win and hasattr(win, "statusBar"):
                win.statusBar().showMessage(msg, 5000)
            return
        self._search_input.clear()
        self.symbol_submitted.emit(raw)

    def _on_symbol_clicked(self, item) -> None:
        symbol = self._table.item(item.row(), 0).text()
        self.symbol_selected.emit(symbol)

    def _on_selection_changed(self) -> None:
        self._delete_btn.setEnabled(len(self._table.selectedItems()) > 0)

    def _delete_selected(self) -> None:
        row = self._table.currentRow()
        if row < 0:
            return
        symbol = self._table.item(row, 0).text()
        if remove_watchlist_symbol(symbol):
            rows = [{"symbol": r["symbol"]} for r in list_watchlist_symbols()]
            self.populate(rows)
            self._delete_btn.setEnabled(False)

    def keyPressEvent(self, event) -> None:
        if event.key() == Qt.Key.Key_Delete and self._delete_btn.isEnabled():
            self._delete_selected()
        super().keyPressEvent(event)

    def populate(self, rows: list[dict]) -> None:
        self._table.setRowCount(len(rows))
        for r, row in enumerate(rows):
            symbol_item = QTableWidgetItem(row.get("symbol", ""))
            symbol_item.setData(Qt.ItemDataRole.UserRole, row.get("symbol", ""))
            self._table.setItem(r, 0, symbol_item)
            self._table.setItem(r, 1, QTableWidgetItem(str(row.get("price", ""))))
            self._table.setItem(
                r, 2, QTableWidgetItem(f'{row.get("change_pct", 0):.2f}%')
            )
            self._table.setItem(
                r, 3, QTableWidgetItem(f'{row.get("rsi", 0):.1f}')
            )
            self._table.setItem(r, 4, QTableWidgetItem(row.get("signal", "")))

            change = row.get("change_pct", 0)
            color = COLOR_BULLISH if change >= 0 else COLOR_BEARISH
            self._table.item(r, 2).setForeground(Qt.GlobalColor.white)
            self._table.item(r, 2).setBackground(parse_color(color))
