from typing import List, Dict, Any
from app.database import get_chroma_client
from app.utils.logger import logger

class VectorService:
    """Service to handle persistence and querying of vector embeddings in ChromaDB."""
    
    def __init__(self, collection_name: str = "maintenance_docs"):
        self.client = get_chroma_client()
        self.collection_name = collection_name
        self.collection = self.client.get_or_create_collection(name=self.collection_name)

    def store_chunks(self, chunks: List[Dict[str, Any]], embeddings: List[List[float]]):
        """Inserts text chunks and their embeddings into the database."""
        if not chunks:
            logger.warning("No chunks provided to store. Skipping database insertion.")
            return

        ids = [chunk["id"] for chunk in chunks]
        texts = [chunk["text"] for chunk in chunks]
        metadatas = [chunk["metadata"] for chunk in chunks]

        logger.info(f"Storing {len(chunks)} embedded chunks in ChromaDB collection '{self.collection_name}' in batches.")
        batch_size = 5000
        for i in range(0, len(ids), batch_size):
            self.collection.add(
                ids=ids[i:i + batch_size],
                embeddings=embeddings[i:i + batch_size],
                metadatas=metadatas[i:i + batch_size],
                documents=texts[i:i + batch_size]
            )
            logger.info(f"Stored batch {i // batch_size + 1}")
        logger.info("Successfully persisted all chunks to local vector database.")

    def search_similar(self, query_embedding: List[float], top_k: int = 3) -> List[Dict[str, Any]]:
        """Queries the vector database for the top k most similar chunks."""
        logger.info(f"Searching ChromaDB for top {top_k} semantically similar chunks...")
        
        # Execute vector similarity search
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )
        
        formatted_results = []
        # Safely extract and format the results returned by ChromaDB
        if results and results.get("documents") and len(results["documents"]) > 0:
            docs = results["documents"][0]
            metadatas = results["metadatas"][0]
            # Distances represent metric proximity (e.g. L2 or Cosine distance)
            distances = results["distances"][0] if "distances" in results else []
            
            for i in range(len(docs)):
                raw_distance = distances[i] if i < len(distances) else 0.0
                # The embeddings are L2 normalized. We convert Squared L2 distance to Cosine Similarity.
                # Formula: Cosine_Similarity = 1 - (L2_Distance / 2)
                true_similarity = max(0.0, 1.0 - (raw_distance / 2.0))
                
                formatted_results.append({
                    "content": docs[i],
                    "source": metadatas[i].get("source", "Unknown"),
                    "score": round(true_similarity, 4)
                })
        
        return formatted_results

    def get_all_document_names(self) -> List[str]:
        """Retrieves a list of all unique documents currently stored in the database."""
        try:
            results = self.collection.get(include=["metadatas"])
            metadatas = results.get("metadatas", [])
            sources = set(m.get("source") for m in metadatas if m and "source" in m)
            return list(sources)
        except Exception as e:
            logger.error(f"Failed to retrieve document names: {e}")
            return []
    
    def clear_database(self):
        """Wipes the database collection entirely, used prior to a fresh ingestion run."""
        try:
            self.client.delete_collection(name=self.collection_name)
            self.collection = self.client.get_or_create_collection(name=self.collection_name)
            logger.info(f"Successfully cleared old records from collection '{self.collection_name}'.")
        except Exception as e:
            logger.warning(f"Failed to clear collection: {e}")
