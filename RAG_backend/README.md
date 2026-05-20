# RAG_AI Backend Pipeline

An advanced, production-ready Retrieval-Augmented Generation (RAG) assistant specifically built for industrial maintenance contexts. By leveraging locally-cached vector databases (ChromaDB) and local embeddings (SentenceTransformers), it parses large PDF maintenance manuals and rigorously enforces LLM output boundaries using the Groq API.

## Technical Architecture
- **API Framework:** FastAPI & Uvicorn
- **LLM Integration:** Groq API (Default `llama3-8b-8192`)
- **Embeddings:** SentenceTransformer `all-MiniLM-L6-v2`
- **Vector Storage:** ChromaDB (Persistent SQLite client)
- **Document Extractors:** PyMuPDF & Langchain RecursiveCharacterTextSplitter

## Installation & Setup

1. Create a Python 3.12+ virtual environment:
```bash
cd RAG_AI/backend
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Update `.env` file with your Groq API key:
```env
GROQ_API_KEY=gsk_your_actual_api_key_here
```

## Running the Ingestion Pipeline

Before querying the assistant, you must download the PDFs, extract text, map the embeddings, and store them in ChromaDB.

You can execute the ingest script directly from your terminal:
```bash
python3 app/ingest.py
```
*Note: The first execution will take several moments as it downloads the PDF maintenance manuals, downloads the SentenceTransformer models to your machine, extracts the chunks, and calculates vector geometry.*

## Running the API Server

Start the Uvicorn web server:
```bash
uvicorn app.main:app --reload --port 8000
```
Interactive Swagger API documentation will be available at `http://localhost:8000/docs`.

## API Endpoints

### 1. Execute RAG Query (`POST /ask`)
Sends a question to the system. The backend retrieves the TOP 3 most semantically similar text chunks from the manuals, injects them into the context window, and forces the Groq LLM to respond completely within those boundaries.

**Request**
```json
{
  "query": "Why does a conveyor belt overheat?"
}
```

**Response**
```json
{
  "query": "Why does a conveyor belt overheat?",
  "answer": "A conveyor belt may overheat due to faulty bearings, improper lubrication, or continuous friction from misaligned tracking...",
  "retrieved_chunks": [
    {
      "content": "Faulty bearings or improper lubrication frequently cause excessive friction resulting in belt overheating...",
      "source": "conveyor_maintenance.pdf",
      "score": 0.892
    }
  ]
}
```

### 2. Trigger Database Re-Index (`POST /ingest`)
This executes the ingestion pipeline silently in the background, downloading any missing PDFs and refreshing the entire ChromaDB collection. It returns immediately while processing asynchronously.

### 3. List Documents (`GET /documents`)
Retrieves all document names currently recognized and chunked inside the local Chroma database.
