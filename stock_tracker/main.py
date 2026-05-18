import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from PyQt6.QtWidgets import QApplication
from config.database import init_db, close_db
from config.settings import GLOBAL_APP_NAME, SEBI_DISCLAIMER
from src.ui.screens.main_window import MainWindow


def main() -> None:
    init_db()

    app = QApplication(sys.argv)
    app.setApplicationName(GLOBAL_APP_NAME)

    window = MainWindow()
    window.show()

    print(SEBI_DISCLAIMER)

    exit_code = app.exec()
    close_db()
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
