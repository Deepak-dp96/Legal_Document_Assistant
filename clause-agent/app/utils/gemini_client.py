"""
Gemini AI Client for Legal Document Analysis
Provides primary AI service with Groq fallback
"""
import os
import json
import logging
from typing import Dict, Any, Optional
import google.generativeai as genai
from groq import Groq

logger = logging.getLogger(__name__)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")
GEMINI_TEMPERATURE = float(os.getenv("GEMINI_TEMPERATURE", "0.2"))
GEMINI_MAX_TOKENS = int(os.getenv("GEMINI_MAX_TOKENS", "8000"))
GEMINI_TOP_P = float(os.getenv("GEMINI_TOP_P", "0.9"))
AI_PROVIDER = os.getenv("AI_PROVIDER", "gemini")

# Configure Groq (fallback)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def get_gemini_client():
    """Initialize and return Gemini client"""
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    
    genai.configure(api_key=GEMINI_API_KEY)
    
    # Use model name without 'models/' prefix - the SDK adds it automatically
    model_name = GEMINI_MODEL # .replace("models/", "")
    
    return genai.GenerativeModel(
        model_name=model_name,
        generation_config={
            "temperature": GEMINI_TEMPERATURE,
            "top_p": GEMINI_TOP_P,
            "max_output_tokens": GEMINI_MAX_TOKENS,
        }
    )

def get_groq_client():
    """Initialize and return Groq client (fallback)"""
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY not found in environment variables")
    return Groq(api_key=GROQ_API_KEY)

def build_structured_context(
    text: str,
    filename: Optional[str] = None,
    document_type: Optional[str] = None,
    previous_errors: Optional[list] = None
) -> str:
    """
    Build structured context for AI analysis
    
    Args:
        text: Extracted document text
        filename: Original filename
        document_type: Type of document
        previous_errors: List of previous attempt errors
    
    Returns:
        Formatted context string
    """
    context_parts = []
    
    # Document metadata
    if filename or document_type:
        context_parts.append("DOCUMENT_METADATA:")
        if filename:
            context_parts.append(f"- filename: {filename}")
        if document_type:
            context_parts.append(f"- document_type: {document_type}")
        context_parts.append("")
    
    # Previous errors (if retrying)
    if previous_errors:
        context_parts.append("PREVIOUS_ATTEMPT_ERRORS:")
        for error in previous_errors:
            context_parts.append(f"- {error}")
        context_parts.append("")
    
    # Document text
    context_parts.append("DOCUMENT_TEXT:")
    context_parts.append(text)
    
    return "\n".join(context_parts)

def call_gemini_api(
    system_prompt: str,
    user_content: str,
    max_retries: int = 3
) -> Dict[str, Any]:
    """
    Call Gemini API with retry logic
    
    Args:
        system_prompt: System instructions
        user_content: User message (document context)
        max_retries: Maximum retry attempts
    
    Returns:
        Dict with 'content', 'model_used', 'provider', 'success'
    """
    previous_errors = []
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Gemini API call attempt {attempt + 1}/{max_retries}")
            
            # Get Gemini client
            model = get_gemini_client()
            
            # Combine system prompt and user content
            full_prompt = f"{system_prompt}\n\n{user_content}"
            
            # Call Gemini API
            response = model.generate_content(full_prompt)
            
            # Extract text
            response_text = response.text
            
            # Validate JSON
            try:
                json_data = json.loads(response_text)
                logger.info(f"Gemini API success on attempt {attempt + 1}")
                return {
                    "content": response_text,
                    "parsed": json_data,
                    "model_used": GEMINI_MODEL,
                    "provider": "gemini",
                    "success": True,
                    "attempt": attempt + 1
                }
            except json.JSONDecodeError as e:
                error_msg = f"JSON validation failed: {str(e)}"
                logger.warning(error_msg)
                previous_errors.append(error_msg)
                
                # Rebuild context with error info for retry
                if attempt < max_retries - 1:
                    user_content = build_structured_context(
                        text=user_content.split("DOCUMENT_TEXT:")[-1].strip(),
                        previous_errors=previous_errors
                    )
                continue
                
        except Exception as e:
            error_msg = f"Gemini API error: {str(e)}"
            logger.error(error_msg)
            previous_errors.append(error_msg)
            
            if attempt == max_retries - 1:
                # Last attempt failed, try Groq fallback
                logger.warning("All Gemini attempts failed, falling back to Groq")
                return call_groq_fallback(system_prompt, user_content, previous_errors)
    
    # Should not reach here, but fallback anyway
    return call_groq_fallback(system_prompt, user_content, previous_errors)

def call_groq_fallback(
    system_prompt: str,
    user_content: str,
    previous_errors: list
) -> Dict[str, Any]:
    """
    Fallback to Groq API when Gemini fails
    
    Args:
        system_prompt: System instructions
        user_content: User message
        previous_errors: List of previous errors
    
    Returns:
        Dict with response data
    """
    try:
        logger.info("Using Groq as fallback provider")
        client = get_groq_client()
        
        # Extract just the document text if structured
        if "DOCUMENT_TEXT:" in user_content:
            text = user_content.split("DOCUMENT_TEXT:")[-1].strip()
        else:
            text = user_content
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Analyze this document:\\n\\n{text[:100000]}"}
            ],
            temperature=0,
            response_format={"type": "json_object"}
        )
        
        response_content = completion.choices[0].message.content
        json_data = json.loads(response_content)
        
        logger.info("Groq fallback successful")
        return {
            "content": response_content,
            "parsed": json_data,
            "model_used": "llama-3.3-70b-versatile",
            "provider": "groq",
            "success": True,
            "fallback": True
        }
        
    except Exception as e:
        logger.error(f"Groq fallback also failed: {e}")
        return {
            "content": None,
            "parsed": None,
            "model_used": None,
            "provider": None,
            "success": False,
            "error": str(e),
            "previous_errors": previous_errors
        }
