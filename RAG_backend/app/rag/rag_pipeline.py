from typing import Dict, Any
from app.services.retrieval_service import RetrievalService
from app.services.llm_service import LLMService
from app.rag.prompt_template import STRICT_RAG_PROMPT
from app.utils.logger import logger

class RAGPipeline:
    """Orchestrator binding vector retrieval with grounded LLM text generation."""
    
    def __init__(self):
        self.retrieval_service = RetrievalService()
        self.llm_service = LLMService()

    async def process_query(self, query: str) -> Dict[str, Any]:
        """Executes the complete Retrieval-Augmented Generation cycle."""
        logger.info(f"--- Starting RAG Workflow for Query: '{query}' ---")
        
        # 1. Execute similarity search over vector database
        retrieved_chunks = self.retrieval_service.retrieve_context(query, top_k=3)
        
        # 2. Format context or handle empty cases (empty database)
        if not retrieved_chunks:
            logger.warning("No context was retrieved. Knowledge base may be empty.")
            return {
                "query": query,
                "answer": "I could not find relevant information in the maintenance knowledge base.",
                "retrieved_chunks": []
            }

        # Build context block containing sources and extracted data
        context_texts = [
            f"Source Document: {chunk['source']}\nContent: {chunk['content']}" 
            for chunk in retrieved_chunks
        ]
        formatted_context = "\n\n".join(context_texts)
        
        # 3. Generate response constrained entirely by context
        answer = await self.llm_service.generate_answer(query, formatted_context, STRICT_RAG_PROMPT)
        
        logger.info("--- RAG Workflow Completed Successfully ---")
        return {
            "query": query,
            "answer": answer,
            "retrieved_chunks": retrieved_chunks
        }
