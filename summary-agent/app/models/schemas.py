from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class SummaryResponse(BaseModel):
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
    ai_suggestions: List[str]
    detailed_analysis: Dict[str, Any]
