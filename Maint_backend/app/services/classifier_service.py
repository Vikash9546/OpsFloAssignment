from app.utils.logger import logger
from app.models.complaint_model import ALLOWED_ISSUE_TYPES, IssueType

class ClassifierService:
    """Service responsible for validating and sanitizing the complaint classification."""

    def validate_classification(self, issue_type: str) -> IssueType:
        """Validates that the issue type matches specified categories. Falls back to 'Unknown' if invalid."""
        if not issue_type:
            logger.warning("Empty classification value supplied. Defaulting to 'Unknown'.")
            return "Unknown"

        # Standardize casing to match requirements exactly
        cleaned = issue_type.strip().capitalize()
        
        # Exact matching verification
        if cleaned in ALLOWED_ISSUE_TYPES:
            return cleaned  # type: ignore

        logger.warning(f"Invalid classification '{issue_type}' suggested by LLM. Defaulting to 'Unknown'.")
        return "Unknown"
