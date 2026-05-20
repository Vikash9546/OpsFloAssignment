import os
from pathlib import Path
from app.utils.logger import logger
from app.utils.helpers import download_pdfs
from app.services.chunking_service import ChunkingService
from app.services.embedding_service import EmbeddingService
from app.services.vector_service import VectorService

def run_ingestion_pipeline():
    """Orchestrates the downloading, chunking, embedding, and storage of documents."""
    logger.info("=== Starting RAG Document Ingestion Pipeline ===")
    
    base_dir = Path(__file__).resolve().parent.parent
    docs_dir = str(base_dir / "app" / "documents")
    
    # 1. Download missing PDFs into local cache
    download_pdfs(docs_dir)
    
    # 2. Extract and chunk PDF texts
    logger.info("Initializing text chunking service...")
    chunking_service = ChunkingService(chunk_size=500, chunk_overlap=100)
    chunks = chunking_service.process_documents(docs_dir)
    
    if not chunks:
        logger.error("No text chunks generated. Aborting ingestion pipeline.")
        return False
    
    # 3. Generate dense vector embeddings for chunks
    embedding_service = EmbeddingService()
    texts_to_embed = [c["text"] for c in chunks]
    embeddings = embedding_service.generate_embeddings(texts_to_embed)
    
    # 4. Persist data in ChromaDB
    vector_service = VectorService()
    vector_service.clear_database() # Ensure clean state
    vector_service.store_chunks(chunks, embeddings)
    
    logger.info("=== RAG Ingestion Pipeline Completed Successfully ===")
    return True

if __name__ == "__main__":
    run_ingestion_pipeline()
