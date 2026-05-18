import subprocess
import sys
import os

def build() -> None:
    cmd = [
        "pyinstaller",
        "--onefile",
        "--windowed",
        "--name", "StockTrackerPro",
        "--add-data", f"src/ui/styles.qss{os.pathsep}src/ui/",
    ]
    if os.path.exists("icon.ico"):
        cmd += ["--icon", "icon.ico"]
    cmd += [
        "--distpath", "dist",
        "--workpath", "build",
        "--specpath", ".",
        "main.py",
    ]
    print("Building installer with PyInstaller...")
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd)
    if result.returncode != 0:
        print("Build failed.", file=sys.stderr)
        sys.exit(result.returncode)
    print("Build succeeded. Binary in dist/StockTrackerPro")


if __name__ == "__main__":
    build()
