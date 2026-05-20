from app.utils.logger import logger

class SummaryService:
    """Service responsible for cleaning, sanitizing, and validating ticket summaries."""

    def sanitize_summary(self, summary: str, original_complaint: str) -> str:
        """Sanitizes generated summary text and supplies a fallback if empty or invalid."""
        if not summary or not summary.strip():
            logger.warning("Empty summary provided. Generating simplified summary from original complaint.")
            # Standard simplistic fallback summary
            if len(original_complaint) > 80:
                return f"{original_complaint[:77]}..."
            return original_complaint

        cleaned = summary.strip()

        # Remove possible leading or trailing quotes
        if (cleaned.startswith('"') and cleaned.endswith('"')) or (cleaned.startswith("'") and cleaned.endswith("'")):
            cleaned = cleaned[1:-1].strip()

        return cleaned
