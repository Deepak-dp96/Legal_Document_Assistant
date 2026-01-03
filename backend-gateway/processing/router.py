from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database.db import get_db
from auth.auth_service import get_current_user
from auth.models import User
from documents.models import Document, AgentAnalysis, Report
from database.db import SessionLocal
from extraction.extractor import extract_text
from pdf_reports.generator import generate_pdf_report, generate_agent_report
import requests
import os
import logging
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api",
    tags=["processing"]
)

CLAUSE_AGENT_URL = os.getenv("CLAUSE_AGENT_URL", "http://clause-agent:8001")
RISK_AGENT_URL = os.getenv("RISK_AGENT_URL", "http://risk-detection-agent:8002")
DRAFT_AGENT_URL = os.getenv("DRAFT_AGENT_URL", "http://draft-agent:8003")
SUMMARY_AGENT_URL = os.getenv("SUMMARY_AGENT_URL", "http://summary-agent:8004")

AGENT_URLS = {
    "clause": CLAUSE_AGENT_URL,
    "risk": RISK_AGENT_URL,
    "draft": DRAFT_AGENT_URL,
    "summary": SUMMARY_AGENT_URL
}

class AgentType(str, Enum):
    """Available agent types for document analysis"""
    clause = "clause"
    risk = "risk"
    draft = "draft"
    summary = "summary"

class ProcessRequest(BaseModel):
    priority_agents: List[str] = ["clause", "risk", "draft", "summary"]

def call_agent(url: str, text: str):
    try:
        response = requests.post(f"{url}/analyze", json={"text": text}, timeout=60)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Error calling agent {url}: {e}")
        return {"error": str(e)}

def save_agent_result(db: Session, agent_name: str, result: dict, document_id: int, user_id: int, text: str):
    success = "error" not in result
    error_msg = result.get("error")
    
    # Check if analysis already exists
    analysis = db.query(AgentAnalysis).filter(
        AgentAnalysis.document_id == document_id,
        AgentAnalysis.agent_type == agent_name
    ).first()
    
    if analysis:
        # Update existing
        analysis.response = result
        analysis.success = success
        # Explicitly clear error if successful
        analysis.error = error_msg if not success else None
        analysis.extracted_text = text
        analysis.created_at = datetime.utcnow() # Update timestamp
    else:
        # Create new
        analysis = AgentAnalysis(
            agent_type=agent_name,
            response=result,
            success=success,
            error=error_msg,
            extracted_text=text,
            document_id=document_id,
            user_id=user_id
        )
        db.add(analysis)
    
    db.commit()

def process_background_task(document_id: int, user_id: int, text: str, remaining_agents: List[str], initial_results: dict, filename: str):
    # Create a new DB session for the background task
    db = SessionLocal()
    try:
        results = initial_results.copy()
        
        for agent_name in remaining_agents:
            if agent_name in AGENT_URLS:
                logger.info(f"Background processing: {agent_name}")
                res = call_agent(AGENT_URLS[agent_name], text)
                results[agent_name] = res
                
                # Save to DB
                save_agent_result(db, agent_name, res, document_id, user_id, text)
                
        # Generate PDF
        try:
            pdf_path = generate_pdf_report(document_id, results, filename)
            logger.info(f"Full PDF Report generated at {pdf_path}")
            
            # Save Report to DB
            report = Report(document_id=document_id, file_path=pdf_path)
            db.add(report)
            db.commit()
            
        except Exception as e:
            logger.error(f"Failed to generate PDF in background: {e}")
            
    finally:
        db.close()

@router.post("/process-document/{document_id}")
async def process_document(
    document_id: int,
    request: ProcessRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    document = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # 1. Extract Text (Synchronous for now to feed the first agent)
    if not document.extracted_text:
        try:
            text = extract_text(document.file_path)
            document.extracted_text = text
            db.commit()
        except Exception as e:
            logger.error(f"Extraction failed: {e}")
            raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")
    else:
        text = document.extracted_text

    # 2. Identify Agents to Run
    agents_to_run = request.priority_agents
    if not agents_to_run:
        agents_to_run = ["clause", "risk", "draft", "summary"]
    
    results = {}
    
    # 3. Run All Agents Synchronously
    for agent_name in agents_to_run:
        if agent_name in AGENT_URLS:
            logger.info(f"Processing agent: {agent_name}")
            # Call Agent
            res = call_agent(AGENT_URLS[agent_name], text)
            results[agent_name] = res
            
            # Save to DB
            save_agent_result(db, agent_name, res, document_id, current_user.id, text)
            
            # Generate Individual Report (only if no error)
            if 'error' not in res:
                try:
                    report_path = generate_agent_report(document_id, agent_name, res, document.filename)
                    logger.info(f"Report for {agent_name} generated at {report_path}")
                    
                    # Save Report Metadata
                    report = Report(document_id=document_id, user_id=current_user.id, agent_type=agent_name, file_path=report_path)
                    db.add(report)
                    db.commit()
                except Exception as e:
                    logger.error(f"Failed to generate report for {agent_name}: {e}")
            else:
                logger.warning(f"Skipping report generation for {agent_name} due to error: {res.get('error')}")

    # 4. Generate Combined PDF Report (only if at least one agent succeeded)
    successful_results = {k: v for k, v in results.items() if 'error' not in v}
    
    if successful_results:
        try:
            pdf_path = generate_pdf_report(document_id, results, document.filename)
            logger.info(f"Full PDF Report generated at {pdf_path}")
            
            # Save Report to DB (agent_type=None for combined)
            report = Report(document_id=document_id, user_id=current_user.id, agent_type="combined", file_path=pdf_path)
            db.add(report)
            db.commit()
        except Exception as e:
            logger.error(f"Failed to generate combined PDF: {e}")
    else:
        logger.warning("No successful agent results, skipping combined report generation")
        # We don't fail the request if PDF fails, but we warn
        
    # 5. Return All Results
    return {
        "message": "Processing complete",
        "results": results,
        "document_id": document_id
    }

def get_latest_agent_results(db: Session, document_id: int) -> dict:
    """Fetch the latest successful result for each agent type for a document."""
    results = {}
    for agent_name in AGENT_URLS.keys():
        analysis = db.query(AgentAnalysis).filter(
            AgentAnalysis.document_id == document_id,
            AgentAnalysis.agent_type == agent_name,
            AgentAnalysis.success == True
        ).order_by(AgentAnalysis.created_at.desc()).first()
        
        if analysis and analysis.response:
            results[agent_name] = analysis.response
    return results

@router.post("/retry-agent/{document_id}/{agent_name}")
async def retry_agent(
    document_id: int,
    agent_name: AgentType,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Convert enum to string for dictionary lookup
    agent_name_str = agent_name.value
    if agent_name_str not in AGENT_URLS:
        raise HTTPException(status_code=400, detail="Invalid agent name")

    document = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not document.extracted_text:
        raise HTTPException(status_code=400, detail="Document text not extracted yet")
        
    text = document.extracted_text
    
    # Call Agent
    logger.info(f"Retrying agent: {agent_name_str}")
    result = call_agent(AGENT_URLS[agent_name_str], text)
    
    # Save Result
    save_agent_result(db, agent_name_str, result, document_id, current_user.id, text)
    
    # Delete old reports for this specific agent
    old_agent_reports = db.query(Report).filter(
        Report.document_id == document_id,
        Report.agent_type == agent_name_str
    ).all()
    
    for old_report in old_agent_reports:
        # Delete physical file if it exists
        if old_report.file_path and os.path.exists(old_report.file_path):
            try:
                os.remove(old_report.file_path)
                logger.info(f"Deleted old report file: {old_report.file_path}")
            except Exception as e:
                logger.warning(f"Failed to delete old report file {old_report.file_path}: {e}")
        # Delete database record
        db.delete(old_report)
    
    db.commit()
    logger.info(f"Deleted {len(old_agent_reports)} old report(s) for agent {agent_name_str}")
    
    # Generate new individual agent report
    try:
        agent_report_path = generate_agent_report(document_id, agent_name_str, result, document.filename)
        logger.info(f"New report for {agent_name_str} generated at {agent_report_path}")
        
        # Save new agent report to DB
        agent_report = Report(
            document_id=document_id, 
            user_id=current_user.id, 
            agent_type=agent_name_str, 
            file_path=agent_report_path
        )
        db.add(agent_report)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to generate individual report for {agent_name_str}: {e}")
    
    # Regenerate combined PDF with all latest results
    all_results = get_latest_agent_results(db, document_id)
    
    # Delete old combined report
    old_combined_reports = db.query(Report).filter(
        Report.document_id == document_id,
        Report.agent_type == "combined"
    ).all()
    
    for old_combined in old_combined_reports:
        if old_combined.file_path and os.path.exists(old_combined.file_path):
            try:
                os.remove(old_combined.file_path)
                logger.info(f"Deleted old combined report: {old_combined.file_path}")
            except Exception as e:
                logger.warning(f"Failed to delete old combined report {old_combined.file_path}: {e}")
        db.delete(old_combined)
    
    db.commit()
    
    try:
        pdf_path = generate_pdf_report(document_id, all_results, document.filename)
        logger.info(f"Combined PDF Report regenerated at {pdf_path}")
        
        # Save new combined report to DB
        report = Report(document_id=document_id, user_id=current_user.id, agent_type="combined", file_path=pdf_path)
        db.add(report)
        db.commit()
        
    except Exception as e:
        logger.error(f"Failed to regenerate combined PDF after retry: {e}")
        # We don't fail the request if PDF fails, but we warn
    
    return {
        "message": f"Agent {agent_name_str} retried successfully",
        "result": result,
        "agent_report_generated": True,
        "combined_report_regenerated": True
    }
