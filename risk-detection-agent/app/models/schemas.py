from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class Risk(BaseModel):
    risk_type: str
    description: str
    severity: str
    risk_percentage: int

class RiskAnalysis(BaseModel):
    identified_risks: List[Risk] = []
    overall_risk_level: Optional[str] = None

class RiskResponse(BaseModel):
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
    detailed_analysis: RiskAnalysis

