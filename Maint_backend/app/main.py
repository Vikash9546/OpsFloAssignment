from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import connect_db, disconnect_db
from app.routes.complaint_routes import router as complaint_router
from app.utils.logger import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Context manager handles startup and shutdown operations for the database client connection state."""
    logger.info("--- Starting Maintainer_AI Backend Application Service ---")
    try:
        # Establish Prisma ORM Postgres connection
        await connect_db()
    except Exception as e:
        logger.error(f"Critical error on startup while establishing database link: {e}")
        # Startup will fail and exit cleanly, alerting operators immediately
        raise e
        
    yield
    
    logger.info("--- Stopping Maintainer_AI Backend Application Service ---")
    await disconnect_db()

# Instantiate the FastAPI App with metadata for automated docs (/docs, /redoc)
app = FastAPI(
    title="Maintainer_AI API",
    description=(
        "Intelligent Maintenance Agent system that processes industrial equipment "
        "complaints using Agentic AI + SQL architecture. Integrates Groq LLM API "
        "for diagnostics, and Prisma ORM + PostgreSQL for persistent records."
    ),
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount complaint routes under root
app.include_router(complaint_router)

@app.get(
    "/",
    tags=["Health"],
    summary="Service Health Check Endpoint"
)
def read_root():
    """Provides immediate status validation and navigation hints to API consumers."""
    return {
        "status": "online",
        "service": "Maintainer_AI System",
        "endpoints": {
            "health": "/",
            "interactive_docs": "/docs",
            "alternative_docs": "/redoc",
            "submit_complaint": "/complaints (POST)",
            "list_complaints": "/complaints (GET)",
            "get_complaint": "/complaints/{ticket_id} (GET)"
        }
    }
