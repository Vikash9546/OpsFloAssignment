from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.schemas.query_schema import QueryRequest
from app.rag.rag_pipeline import RAGPipeline
from app.services.vector_service import VectorService
from app.ingest import run_ingestion_pipeline
from app.utils.logger import logger

router = APIRouter()
pipeline = RAGPipeline()
vector_service = VectorService()

@router.post("/ask", summary="Ask a technical maintenance question.")
async def ask_question(request: QueryRequest):
    """Retrieves relevant context chunks and passes them to the Groq LLM for a grounded answer."""
    logger.info(f"API Invocation: POST /ask | Query: {request.query}")
    try:
        response = await pipeline.process_query(request.query)
        return response
    except ValueError as ve:
        logger.error(f"Configuration ValueError: {ve}")
        raise HTTPException(status_code=503, detail=str(ve))
    except Exception as e:
        logger.error(f"Unexpected RAG Pipeline failure: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while processing query.")

@router.post("/ingest", summary="Run background document ingestion pipeline.")
async def ingest_documents(background_tasks: BackgroundTasks):
    """Downloads public PDFs, extracts text, chunks it, generates embeddings, and stores to ChromaDB."""
    logger.info("API Invocation: POST /ingest")
    # Offloading this long-running task to the background
    background_tasks.add_task(run_ingestion_pipeline)
    return {"message": "Document ingestion pipeline started in the background. Check application logs for progress."}

@router.get("/documents", summary="List all currently indexed documents.")
async def list_documents():
    """Queries ChromaDB metadata to identify all source files loaded into the vector space."""
    logger.info("API Invocation: GET /documents")
    try:
        docs = vector_service.get_all_document_names()
        return {"indexed_documents": docs}
    except Exception as e:
        logger.error(f"Failed to fetch document metadata: {e}")
        raise HTTPException(status_code=500, detail="Internal server error fetching document metadata.")
