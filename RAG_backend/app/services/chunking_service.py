import os
import fitz  # PyMuPDF
from typing import List, Dict, Any
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.utils.logger import logger

class ChunkingService:
    """Service to extract text from PDFs and recursively chunk it."""
    
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 100):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ".", " ", ""]
        )

    def process_documents(self, docs_dir: str) -> List[Dict[str, Any]]:
        """Reads all PDFs in the given directory and returns chunked text objects with metadata."""
        chunks = []
        if not os.path.exists(docs_dir):
            logger.warning(f"Documents directory '{docs_dir}' does not exist.")
            return chunks

        for filename in os.listdir(docs_dir):
            if not filename.lower().endswith(".pdf"):
                continue
            
            filepath = os.path.join(docs_dir, filename)
            logger.info(f"Parsing text from PDF: {filename}")
            
            try:
                text = ""
                with fitz.open(filepath) as doc:
                    for page in doc:
                        text += page.get_text("text") + "\n"
                
                # Sanitize text
                clean_text = text.replace("\x00", "").strip()
                if not clean_text:
                    logger.warning(f"No extractable text found in {filename}.")
                    continue

                split_texts = self.splitter.split_text(clean_text)
                for i, chunk_text in enumerate(split_texts):
                    # Ensure minimum chunk quality
                    if len(chunk_text.strip()) < 10:
                        continue
                        
                    chunks.append({
                        "text": chunk_text,
                        "metadata": {
                            "source": filename,
                            "chunk_index": i
                        },
                        "id": f"{filename}_chunk_{i}"
                    })
            except Exception as e:
                logger.error(f"Failed to process PDF {filename}: {e}")
        
        logger.info(f"Extracted {len(chunks)} total chunks from documents.")
        return chunks
