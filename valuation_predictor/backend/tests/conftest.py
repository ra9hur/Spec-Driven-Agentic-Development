import sys
import os
from pathlib import Path

_root = str(Path(__file__).parent.parent)
sys.path.insert(0, _root)
os.environ["OLLAMA_BASE_URL"] = "http://localhost:11434/v1"
os.environ["OLLAMA_MODEL"] = "llama3.2"
