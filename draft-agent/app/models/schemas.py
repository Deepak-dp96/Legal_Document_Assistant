from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class Suggestion(BaseModel):
    issue: str
    location: Optional[str] = None
    suggested_change: Optional[str] = None

class DraftResponse(BaseModel):
    agent_name: str
    model_used: str
    is_legal_document: bool
    document_type: str
    confidence_percentage: int
    risk_percentage: int
    categories: List[str]
    tags: List[str]
    key_insights: List[str]
    summary: str
    ai_suggestions: List[Suggestion]
    detailed_analysis: Dict[str, Any]
