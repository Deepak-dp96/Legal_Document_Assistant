from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ClauseInsight(BaseModel):
    clause_name: str
    clause_type: str
    summary: str
    risk_level: str
    risk_description: Optional[str] = None
    confidence_percentage: Optional[int] = None

class ClauseResponse(BaseModel):
    agent_name: str
    model_used: str
    is_legal_document: bool
    document_type: str
    confidence_percentage: int
    risk_percentage: int
    categories: List[str]
    tags: List[str]
    key_insights: List[ClauseInsight]
    summary: str
    ai_suggestions: List[str]
    detailed_analysis: Dict[str, Any]

