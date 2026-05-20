from typing import List, Dict, Any
from app.services.embedding_service import EmbeddingService
from app.services.vector_service import VectorService
from app.utils.logger import logger

class RetrievalService:
    """Service to connect semantic query requests with vector database matches."""
    
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.vector_service = VectorService()

    def retrieve_context(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Transforms query to vector space and returns the top_k most similar chunks."""
        logger.info(f"Retrieving context for query: '{query}'")
        
        # Create a single vector embedding for the incoming query text
        query_embedding = self.embedding_service.generate_embeddings([query])[0]
        
        # Search the database using the vector
        results = self.vector_service.search_similar(query_embedding, top_k=top_k)
        
        logger.info(f"Successfully retrieved {len(results)} context chunks.")
        return results
