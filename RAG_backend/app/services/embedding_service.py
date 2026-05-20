from typing import List
from sentence_transformers import SentenceTransformer
from app.utils.logger import logger

class EmbeddingService:
    """Service to generate dense vector embeddings from text chunks."""
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        logger.info(f"Initializing SentenceTransformer embedding model: {model_name}")
        self.model = SentenceTransformer(model_name)

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Converts a list of text strings into a list of vector embeddings."""
        logger.info(f"Generating vector embeddings for {len(texts)} chunks...")
        
        # Generates numpy array and converts to Python native lists for Chroma
        embeddings = self.model.encode(texts, convert_to_numpy=True).tolist()
        return embeddings
