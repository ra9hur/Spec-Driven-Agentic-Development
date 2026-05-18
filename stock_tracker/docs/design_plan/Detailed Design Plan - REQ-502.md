**Universal Runtime Dependency Standalone Package**

- **Role**  
    Lead DevOps / Build Engineer.
- **Task**  
    Create a `build_installer.py` script that packages the application into a single standalone binary using PyInstaller with `--onefile` and `--windowed` flags, bundling the QSS stylesheet as a data file.
- **Context**  
    End users must be able to run StockTracker Pro without installing a Python runtime. PyInstaller compiles the application and all its dependencies into a single executable. The `build()` function in `build_installer.py` constructs the PyInstaller command: `--onefile --windowed --name StockTrackerPro`, adds `src/ui/styles.qss` via `--add-data`, and optionally includes an `icon.ico` file if present. The output lands at `dist/StockTrackerPro`.
- **Constraints**
    - **Technology Constraint:** Must use PyInstaller CLI invoked via `subprocess.run`. No `PyInstaller.__main__` or `specfile` approach.
    - **Data Inclusion:** `src/ui/styles.qss` is always added as `--add-data` with the target directory `src/ui/` (platform-specific path separator via `os.pathsep`).
    - **Optional Icon:** `icon.ico` is included only if `os.path.exists("icon.ico")` returns `True`.
    - **Exit on Failure:** If PyInstaller returns a non-zero exit code, `sys.exit(result.returncode)` is called.
- **Format**  
    Standalone script `build_installer.py` at the project root with a `build() -> None` function. The `if __name__ == "__main__"` block calls `build()`. The test merely checks that the file exists.
- **Acceptance Criteria**
    1. **Build Script Exists:** `os.path.exists("build_installer.py")` returns `True` (TestREQ502::test_build_script_exists).
    2. **Build Produces Binary:** Running `python build_installer.py` (on a system with PyInstaller) creates `dist/StockTrackerPro`.
- **Module API** (`build_installer.py`)

    | Function | Signature | Returns | Notes |
    |---|---|---|---|
    | `build` | `() -> None` | `None` | Runs `subprocess.run` on PyInstaller; exits on non-zero return code |

---

