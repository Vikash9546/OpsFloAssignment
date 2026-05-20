from datetime import datetime
from typing import Dict, Any
from app.services.llm_service import LLMService
from app.services.classifier_service import ClassifierService
from app.services.priority_service import PriorityService
from app.services.summary_service import SummaryService
from app.services.ticket_service import TicketService
from app.database import db
from app.utils.logger import logger

class MaintenanceAgent:
    """Intelligent Maintenance Agent that orchestrates the entire industrial complaint processing workflow."""

    def __init__(self) -> None:
        self.llm_service = LLMService()
        self.classifier_service = ClassifierService()
        self.priority_service = PriorityService()
        self.summary_service = SummaryService()
        self.ticket_service = TicketService()

    async def process_complaint(self, original_complaint: str) -> Dict[str, Any]:
        """Orchestrates complaint analysis, classification, priority detection, summary generation,

        ticket ID assignment, and database storage in PostgreSQL.
        """
        logger.info(f"Agent starting workflow for complaint: '{original_complaint}'")

        try:
            # 1. Analyze using Groq LLM
            llm_result = await self.llm_service.analyze_complaint(original_complaint)
            
            # 2. Extract and validate classification
            suggested_type = llm_result.get("issue_type", "Unknown")
            issue_type = self.classifier_service.validate_classification(suggested_type)
            
            # 3. Extract and validate priority
            suggested_priority = llm_result.get("priority", "Medium")
            priority = self.priority_service.validate_priority(suggested_priority)
            
            # 4. Extract and validate summary
            suggested_summary = llm_result.get("summary", "")
            summary = self.summary_service.sanitize_summary(suggested_summary, original_complaint)
            
            # 5. Generate sequential Ticket ID
            ticket_id = await self.ticket_service.generate_ticket_id()
            
            logger.info(
                f"Agent processed complaint successfully. "
                f"Ticket: {ticket_id} | Class: {issue_type} | Priority: {priority}"
            )

            # 6. Store in PostgreSQL database using Prisma ORM
            try:
                # Standard check to ensure database client is connected before writing
                if not db.is_connected():
                    logger.warning("Prisma client was not connected, attempting connection now.")
                    await db.connect()

                # Save record to database
                db_record = await db.complaint.create(
                    data={
                        "ticket_id": ticket_id,
                        "original_complaint": original_complaint,
                        "issue_type": issue_type,
                        "priority": priority,
                        "summary": summary,
                        "status": "New"
                    }
                )
                logger.info(f"Successfully saved ticket {ticket_id} to PostgreSQL database.")
                
                # Convert the Prisma model to a dict for the schema/API response
                # Prisma client models have dict() method or similar accessors
                return {
                    "ticket_id": db_record.ticket_id,
                    "original_complaint": db_record.original_complaint,
                    "issue_type": db_record.issue_type,
                    "priority": db_record.priority,
                    "summary": db_record.summary,
                    "status": db_record.status,
                    "created_at": db_record.created_at
                }

            except Exception as dbe:
                logger.error(f"Database error encountered while saving ticket {ticket_id}: {dbe}")
                raise RuntimeError(f"Database persistence failure: {dbe}")

        except Exception as e:
            logger.error(f"Agent pipeline processing encountered an error: {e}")
            raise e
