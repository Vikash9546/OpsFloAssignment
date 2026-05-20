from datetime import datetime
import random
from app.database import db
from app.utils.logger import logger

class TicketService:
    """Service responsible for generating clean, chronological ticket IDs in the TKT-YYYY-XXXX format."""

    async def generate_ticket_id(self) -> str:
        """Determines the current year and increments the sequence from the last ticket ID in the database."""
        current_year = datetime.now().year
        year_prefix = f"TKT-{current_year}-"

        try:
            # Check if database client is initialized and connected
            if not db.is_connected():
                logger.warning("Database client is not connected. Generating safe randomized sequence fallback.")
                return self._generate_fallback_id(year_prefix)

            # Query the database for the highest ticket ID of the current year
            # Since IDs are padded string numbers ('0001', '0002'), sorting descending works reliably
            last_complaint = await db.complaint.find_first(
                where={
                    "ticket_id": {
                        "startswith": year_prefix
                    }
                },
                order={
                    "ticket_id": "desc"
                }
            )

            if last_complaint:
                last_ticket_id = last_complaint.ticket_id
                parts = last_ticket_id.split("-")
                
                if len(parts) == 3:
                    try:
                        last_sequence = int(parts[2])
                        next_sequence = last_sequence + 1
                    except ValueError:
                        logger.error(f"Failed to parse sequential number from ticket_id '{last_ticket_id}'. Resetting to 1.")
                        next_sequence = 1
                else:
                    logger.warning(f"Malformed ticket_id format discovered in DB: '{last_ticket_id}'. Resetting to 1.")
                    next_sequence = 1
            else:
                # No complaints exist for the current year yet
                logger.info(f"No existing tickets found for year {current_year}. Initializing sequence from 1.")
                next_sequence = 1

            formatted_seq = f"{next_sequence:04d}"
            ticket_id = f"{year_prefix}{formatted_seq}"
            logger.info(f"Generated sequential ticket ID: {ticket_id}")
            return ticket_id

        except Exception as e:
            logger.error(f"Error occurred during ticket ID generation database lookup: {e}. Falling back to randomized sequence.")
            return self._generate_fallback_id(year_prefix)

    def _generate_fallback_id(self, year_prefix: str) -> str:
        """Generates a pseudo-randomized sequence for ticket generation when the DB query fails."""
        random_suffix = random.randint(1, 9999)
        ticket_id = f"{year_prefix}{random_suffix:04d}"
        logger.info(f"Generated fallback ticket ID: {ticket_id}")
        return ticket_id
