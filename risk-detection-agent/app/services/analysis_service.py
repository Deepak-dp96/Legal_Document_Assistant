import os
import json
import logging
from app.utils.gemini_client import call_gemini_api, build_structured_context
from app.models.schemas import RiskResponse

logger = logging.getLogger(__name__)

def get_system_prompt():
    prompt_path = os.path.join(os.path.dirname(__file__), "../prompts/system_prompt.txt")
    with open(prompt_path, "r") as f:
        return f.read()

def analyze_document(text: str, filename: str = None) -> dict:
    """
    Analyze document using Gemini AI with Groq fallback
    
    Args:
        text: Extracted document text
        filename: Optional filename for context
    
    Returns:
        Dictionary with analysis results
    """
    system_prompt = get_system_prompt()
    
    # Build structured context
    user_content = build_structured_context(
        text=text,
        filename=filename,
        document_type="legal_document"
    )
    
    # Call Gemini API with retry and fallback
    response = call_gemini_api(
        system_prompt=system_prompt,
        user_content=user_content,
        max_retries=3
    )
    
    if not response["success"]:
        logger.error(f"Analysis failed: {response.get('error')}")
        return {
            "error": "Failed to process document after retries",
            "details": response.get("error"),
            "previous_errors": response.get("previous_errors", [])
        }
    
    try:
        # Validate with Pydantic
        validated_data = RiskResponse(**response["parsed"])
        result = validated_data.model_dump()
        
        # Log success
        logger.info(f"Analysis successful using {response['provider']} - {response['model_used']}")
        if response.get("fallback"):
            logger.warning("Used Groq fallback after Gemini failures")
        
        return result
        
    except Exception as e:
        logger.error(f"Validation failed: {e}")
        return {
            "error": "Response validation failed",
            "details": str(e),
            "raw_response": response.get("content")
        }
