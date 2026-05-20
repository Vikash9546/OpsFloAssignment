from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.rag_routes import router as rag_router
from app.utils.logger import logger

app = FastAPI(
    title="RAG_AI Intelligent Assistant API",
    description="An industrial maintenance Retrieval-Augmented Generation assistant powered by ChromaDB, SentenceTransformers, PyMuPDF, and the Groq API.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect blueprint routes
app.include_router(rag_router)

@app.get("/", tags=["Health"])
def read_root():
    """Primary health check and endpoint documentation mapping."""
    return {
        "status": "online",
        "service": "RAG_AI Backend Pipeline",
        "endpoints": {
            "health_check": "/",
            "interactive_docs": "/docs",
            "ask_question": "/ask (POST)",
            "run_ingestion": "/ingest (POST)",
            "list_documents": "/documents (GET)"
        }
    }
