import chromadb
from pathlib import Path
from app.utils.logger import logger

base_dir = Path(__file__).resolve().parent.parent
chroma_path = base_dir / "chroma_db"

def get_chroma_client() -> chromadb.ClientAPI:
    """Returns an instance of the persistent ChromaDB client."""
    # Ensure the database directory exists
    Path(chroma_path).mkdir(parents=True, exist_ok=True)
    
    try:
        # Connect to local SQLite-backed Chroma database
        client = chromadb.PersistentClient(path=str(chroma_path))
        return client
    except Exception as e:
        logger.error(f"Critical Error: Failed to initialize ChromaDB Persistent Client at {chroma_path}: {e}")
        raise e
