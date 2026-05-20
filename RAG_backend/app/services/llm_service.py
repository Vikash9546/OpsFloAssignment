from groq import AsyncGroq
from app.config import GROQ_API_KEY
from app.utils.logger import logger

class LLMService:
    """Service to handle contextual response generation via Groq API."""
    
    def __init__(self):
        if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_api_key":
            logger.warning("GROQ_API_KEY is not set correctly. Generation endpoints will fail.")
            self.client = None
        else:
            self.client = AsyncGroq(api_key=GROQ_API_KEY)

    async def generate_answer(self, query: str, formatted_context: str, system_prompt: str) -> str:
        """Injects contextual constraints into the LLM prompt and retrieves an answer."""
        if not self.client:
            raise ValueError("Groq API key not configured or invalid.")
        
        # Inject the retrieved string content into the strict RAG template
        prompt = system_prompt.replace("{context}", formatted_context)
        
        try:
            logger.info("Executing Groq LLM inference...")
            response = await self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": query}
                ],
                model="llama-3.1-8b-instant",
                temperature=0.0  # Zero temperature for maximum deterministic context adherence
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"LLM generation failed: {e}")
            raise e
