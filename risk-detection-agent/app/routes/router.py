from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging
from app.services.analysis_service import analyze_document

logger = logging.getLogger(__name__)

router = APIRouter()

class AnalyzeRequest(BaseModel):
    text: str

@router.post("/analyze")
async def analyze(request: AnalyzeRequest):
    logger.info("Received analysis request")
    result = analyze_document(request.text)
    if "error" in result:
        logger.error(f"Analysis failed: {result['error']}")
        raise HTTPException(status_code=500, detail=result)
    return result
