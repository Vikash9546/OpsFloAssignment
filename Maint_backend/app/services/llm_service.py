import json
from typing import Dict, Any
from groq import AsyncGroq
from app.config import GROQ_API_KEY, GROQ_MODEL
from app.utils.logger import logger

class LLMService:
    """Service to handle interactions with the Groq LLM API for analyzing complaints."""

    def __init__(self) -> None:
        self.api_key = GROQ_API_KEY
        if not self.api_key or self.api_key == "your_groq_api_key":
            logger.warning("GROQ_API_KEY has not been set or is still the default placeholder. API requests will fail.")
            self.client = None
        else:
            self.client = AsyncGroq(api_key=self.api_key)

    async def analyze_complaint(self, complaint: str) -> Dict[str, Any]:
        """Sends complaint to Groq LLM and returns the parsed structured JSON response."""
        if not self.client:
            logger.error("Groq API client is not initialized due to missing or invalid GROQ_API_KEY.")
            raise ValueError("Groq API key is missing or invalid. Please check your environment configuration.")

        system_prompt = (
            "You are an industrial maintenance AI assistant.\n\n"
            "Your tasks:\n"
            "1. Analyze maintenance complaints.\n"
            "2. Classify into ONLY:\n"
            "   - Electrical\n"
            "   - Mechanical\n"
            "   - Sensor\n"
            "   - Unknown\n\n"
            "3. Assign ONLY:\n"
            "   - Low\n"
            "   - Medium\n"
            "   - High\n\n"
            "4. Generate concise maintenance summaries.\n\n"
            "Return ONLY valid JSON.\n"
            "No markdown.\n"
            "No explanations."
        )

        user_content = (
            f"Complaint: \"{complaint}\"\n\n"
            "Please analyze this complaint and output your response in this exact JSON structure:\n"
            "{\n"
            '  "issue_type": "<Electrical | Mechanical | Sensor | Unknown>",\n'
            '  "priority": "<Low | Medium | High>",\n'
            '  "summary": "<Concise summary of the maintenance complaint>"\n'
            "}"
        )

        try:
            logger.info(f"Submitting complaint to Groq using model '{GROQ_MODEL}'...")
            
            # Using JSON response format if supported by the model
            completion = await self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                model=GROQ_MODEL,
                response_format={"type": "json_object"},
                temperature=0.0,  # Zero temperature for highly deterministic classifications
            )

            raw_response = completion.choices[0].message.content
            if not raw_response:
                raise ValueError("Received empty response from Groq API.")

            logger.info(f"Received LLM response: {raw_response}")
            
            # Parse and return JSON
            parsed_data = json.loads(raw_response.strip())
            return parsed_data

        except json.JSONDecodeError as jde:
            logger.error(f"Failed to decode Groq JSON response. Raw string: {raw_response}. Error: {jde}")
            # Return a default fallback structure that other services can validate and recover from
            return self._get_fallback_payload(complaint, f"JSON parse error: {jde}")
        except Exception as e:
            logger.error(f"Unexpected error encountered during LLM complaint analysis: {e}")
            return self._get_fallback_payload(complaint, f"LLM error: {e}")

    def _get_fallback_payload(self, complaint: str, error_msg: str) -> Dict[str, Any]:
        """Provides a safe backup payload in the event of an LLM failure."""
        logger.info("Engaging LLM service fallback recovery.")
        
        # Super simple rule-based classification heuristics for local safety recovery
        complaint_lower = complaint.lower()
        
        # Classification fallback heuristic
        if any(w in complaint_lower for w in ["motor", "wire", "voltage", "current", "breaker", "electrical", "short"]):
            issue_type = "Electrical"
        elif any(w in complaint_lower for w in ["gear", "pump", "leak", "grind", "bearing", "valve", "hydraulic", "mechanical"]):
            issue_type = "Mechanical"
        elif any(w in complaint_lower for w in ["sensor", "temp", "rtd", "thermocouple", "transmitter", "gauge"]):
            issue_type = "Sensor"
        else:
            issue_type = "Unknown"

        # Priority fallback heuristic
        if any(w in complaint_lower for w in ["smoke", "fire", "spark", "explosion", "leak"]):
            priority = "High"
        elif any(w in complaint_lower for w in ["intermittent", "fail", "broken", "stop"]):
            priority = "Medium"
        else:
            priority = "Low"

        # Safe summary format
        summary = f"Summary generated via fallback: {complaint[:60]}..." if len(complaint) > 60 else complaint

        return {
            "issue_type": issue_type,
            "priority": priority,
            "summary": summary,
            "_fallback_active": True,
            "_fallback_reason": error_msg
        }
