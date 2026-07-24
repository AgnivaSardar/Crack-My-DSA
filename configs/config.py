import os
# Force PyTorch backend for Hugging Face to avoid TensorFlow/Keras import errors
os.environ["USE_TORCH"] = "1"
os.environ["USE_TF"] = "0"

from pathlib import Path
from dotenv import load_dotenv

# Load env variables from .env file
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Embedding
EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER", "gemini").lower()
if EMBEDDING_PROVIDER not in ["local", "gemini"]:
    EMBEDDING_PROVIDER = "gemini"

# Data Directories
DATA_DIR = Path(os.getenv("DATA_DIR", "leetcode-company-wise-problems-main"))
if not DATA_DIR.is_absolute():
    DATA_DIR = BASE_DIR / DATA_DIR

CHROMA_DB_DIR = Path(os.getenv("CHROMA_DB_DIR", "data/chroma_db"))
if not CHROMA_DB_DIR.is_absolute():
    CHROMA_DB_DIR = BASE_DIR / CHROMA_DB_DIR

PROCESSED_DATA_DIR = Path(os.getenv("PROCESSED_DATA_DIR", "data/processed"))
if not PROCESSED_DATA_DIR.is_absolute():
    PROCESSED_DATA_DIR = BASE_DIR / PROCESSED_DATA_DIR

# Ingestion configuration
TOP_COMPANIES_ONLY = os.getenv("TOP_COMPANIES_ONLY", "true").lower() == "true"
try:
    LIMIT_COMPANIES_COUNT = int(os.getenv("LIMIT_COMPANIES_COUNT", "100"))
except ValueError:
    LIMIT_COMPANIES_COUNT = 100

# Create directories if they don't exist
CHROMA_DB_DIR.parent.mkdir(parents=True, exist_ok=True)
PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
