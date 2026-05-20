from app.utils.logger import logger
from app.models.complaint_model import ALLOWED_PRIORITIES, PriorityLevel

class PriorityService:
    """Service responsible for validating and sanitizing issue priority levels."""

    def validate_priority(self, priority: str) -> PriorityLevel:
        """Validates that priority matches specified categories. Falls back to 'Medium' if invalid."""
        if not priority:
            logger.warning("Empty priority level supplied. Defaulting to 'Medium'.")
            return "Medium"

        # Standardize casing to match requirements (e.g. "High", "Medium", "Low")
        cleaned = priority.strip().capitalize()

        if cleaned in ALLOWED_PRIORITIES:
            return cleaned  # type: ignore

        logger.warning(f"Invalid priority level '{priority}' suggested by LLM. Defaulting to 'Medium'.")
        return "Medium"
