from typing import List
from fastapi import APIRouter, HTTPException, status
from app.schemas.complaint_schema import ComplaintRequest, ComplaintResponse, StatusUpdateRequest
from app.agents.maintenance_agent import MaintenanceAgent
from app.database import db
from app.utils.logger import logger

router = APIRouter()
agent = MaintenanceAgent()

@router.post(
    "/complaints", 
    response_model=ComplaintResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Process a natural language complaint",
    description="Analyzes the natural language industrial complaint text, classifies the category, detects the priority level, formats a concise summary, generates a unique ticket ID, stores it in the database, and returns the ticket details."
)
async def create_complaint(payload: ComplaintRequest):
    logger.info(f"HTTP POST /complaints invoked with complaint length: {len(payload.complaint)} chars.")
    try:
        result = await agent.process_complaint(payload.complaint)
        return result
    except ValueError as ve:
        # Config errors (e.g. missing Groq API Key)
        logger.error(f"Value/Configuration Error in POST /complaints: {ve}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
            detail=f"Configuration or Service Dependency Error: {str(ve)}"
        )
    except RuntimeError as re:
        # DB / persistence errors
        logger.error(f"Runtime/Database persistence error in POST /complaints: {re}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Database Persistence Failure: {str(re)}"
        )
    except Exception as e:
        logger.error(f"Unexpected unhandled error in POST /complaints: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="An unexpected server error occurred during complaint processing. Please try again."
        )

@router.get(
    "/complaints", 
    response_model=List[ComplaintResponse],
    summary="List all complaint tickets",
    description="Retrieves a list of all maintenance tickets stored in the PostgreSQL database, sorted with the newest records first."
)
async def get_all_complaints():
    logger.info("HTTP GET /complaints invoked to list all tickets.")
    try:
        # Ensure database is connected
        if not db.is_connected():
            await db.connect()

        records = await db.complaint.find_many(order={"created_at": "desc"})
        
        response_data = []
        for r in records:
            response_data.append({
                "ticket_id": r.ticket_id,
                "original_complaint": r.original_complaint,
                "issue_type": r.issue_type,
                "priority": r.priority,
                "summary": r.summary,
                "status": r.status,
                "created_at": r.created_at
            })
        logger.info(f"Successfully retrieved {len(response_data)} ticket records from the database.")
        return response_data
    except Exception as e:
        logger.error(f"Failed to fetch complaints list from database: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to query complaints database: {e}"
        )

@router.get(
    "/complaints/{ticket_id}", 
    response_model=ComplaintResponse,
    summary="Get complaint ticket by ID",
    description="Retrieves the detailed record of a single maintenance complaint by searching for its unique ticket ID (e.g. TKT-2026-0001)."
)
async def get_complaint_by_id(ticket_id: str):
    logger.info(f"HTTP GET /complaints/{ticket_id} invoked.")
    try:
        # Normalize and basic pattern check for path parameter
        ticket_id = ticket_id.strip()
        
        # Ensure database is connected
        if not db.is_connected():
            await db.connect()

        r = await db.complaint.find_unique(where={"ticket_id": ticket_id})
        if not r:
            logger.warning(f"Requested Ticket ID '{ticket_id}' was not found in the system.")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"Complaint ticket with ID '{ticket_id}' was not found."
            )
            
        logger.info(f"Successfully retrieved ticket record for '{ticket_id}'.")
        return {
            "ticket_id": r.ticket_id,
            "original_complaint": r.original_complaint,
            "issue_type": r.issue_type,
            "priority": r.priority,
            "summary": r.summary,
            "status": r.status,
            "created_at": r.created_at
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to query database for ticket '{ticket_id}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Database query failed for ticket ID '{ticket_id}': {e}"
        )

@router.patch(
    "/complaints/{ticket_id}/status", 
    response_model=ComplaintResponse,
    summary="Update ticket status",
    description="Updates the operational status of a single maintenance complaint by searching for its unique ticket ID."
)
async def update_complaint_status(ticket_id: str, payload: StatusUpdateRequest):
    logger.info(f"HTTP PATCH /complaints/{ticket_id}/status invoked with status: {payload.status}")
    try:
        ticket_id = ticket_id.strip()
        status_val = payload.status.strip()
        
        # Validation
        if status_val not in ["New", "In Progress", "Resolved"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status. Allowed values are: 'New', 'In Progress', 'Resolved'."
            )
            
        # Ensure database is connected
        if not db.is_connected():
            await db.connect()

        # Update record
        r = await db.complaint.update(
            where={"ticket_id": ticket_id},
            data={"status": status_val}
        )
        
        if not r:
            logger.warning(f"Requested Ticket ID '{ticket_id}' was not found for update.")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"Complaint ticket with ID '{ticket_id}' was not found."
            )
            
        logger.info(f"Successfully updated ticket record status for '{ticket_id}' to '{status_val}'.")
        return {
            "ticket_id": r.ticket_id,
            "original_complaint": r.original_complaint,
            "issue_type": r.issue_type,
            "priority": r.priority,
            "summary": r.summary,
            "status": r.status,
            "created_at": r.created_at
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update database for ticket '{ticket_id}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Database update failed for ticket ID '{ticket_id}': {e}"
        )
