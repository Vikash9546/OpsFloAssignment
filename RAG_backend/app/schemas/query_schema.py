from pydantic import BaseModel, Field

class QueryRequest(BaseModel):
    """Schema representing an incoming user question for the RAG assistant."""
    query: str = Field(..., description="The maintenance question to ask the AI assistant.", min_length=3)
