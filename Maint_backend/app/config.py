import os
from pathlib import Path
from dotenv import load_dotenv
from app.utils.logger import logger

# Resolve the absolute path of the backend directory to locate .env
base_dir = Path(__file__).resolve().parent.parent
env_path = base_dir / ".env"

# Load environment variables from .env if it exists
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
    logger.info(f"Loaded environment configuration from {env_path}")
else:
    load_dotenv()
    logger.warning("No local .env file found. Reading settings from parent environment variables.")

# App Configuration
DATABASE_URL = os.getenv("DATABASE_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Optional configurations with safe defaults
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama3-8b-8192")

# Basic validation warnings
if not DATABASE_URL:
    logger.warning("DATABASE_URL is not set. Ensure it is configured before running database migrations or server.")
if not GROQ_API_KEY:
    logger.warning("GROQ_API_KEY is not set. Industrial complaints LLM analyses will fail without this key.")
