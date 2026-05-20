import os
from pathlib import Path
from dotenv import load_dotenv
from app.utils.logger import logger

base_dir = Path(__file__).resolve().parent.parent
env_path = base_dir / ".env"

if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_api_key":
    logger.warning("GROQ_API_KEY is not configured correctly. LLM operations will fail.")
