from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from auth.auth_service import get_current_user
from auth.models import User
from documents.upload_service import save_upload_file

router = APIRouter(
    prefix="/documents",
    tags=["documents"]
)

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(('.pdf', '.docx', '.txt')):
        raise HTTPException(status_code=400, detail="Invalid file format. Only PDF, DOCX, and TXT are supported.")
    
    document = save_upload_file(file, current_user.id, db)
    return document

from fastapi.responses import FileResponse
import os

from typing import Literal

@router.get("/{doc_id}/report")
async def get_report(
    doc_id: int,
    agent: Literal["clause", "risk", "draft", "summary", "combined"] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch report from DB
    from documents.models import Report
    query = db.query(Report).filter(Report.document_id == doc_id)
    
    if agent:
        query = query.filter(Report.agent_type == agent)
    else:
        # Default to combined or latest
        query = query.filter(Report.agent_type == "combined")
        
    report = query.order_by(Report.created_at.desc()).first()
    
    # Fallback if no combined report found, just get the latest one
    if not report and not agent:
         report = db.query(Report).filter(Report.document_id == doc_id).order_by(Report.created_at.desc()).first()
    
    if not report or not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="Report not found")
    
    return FileResponse(report.file_path, media_type="application/pdf", filename=os.path.basename(report.file_path))

from documents.models import Document, AgentAnalysis, Report

@router.get("/reports")
def get_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch all documents for the user
    documents = db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.upload_date.desc()).all()
    
    reports_data = []
    for doc in documents:
        # Get risk analysis
        risk_analysis = db.query(AgentAnalysis).filter(
            AgentAnalysis.document_id == doc.id,
            AgentAnalysis.agent_type == "risk",
            AgentAnalysis.success == True
        ).order_by(AgentAnalysis.created_at.desc()).first()
        
        if risk_analysis and risk_analysis.response:
            data = risk_analysis.response
            
            # Extract summary stats
            detailed = data.get("detailed_analysis", {})
            risks = detailed.get("identified_risks", [])
            
            # Count risks by severity
            stats = {
                "total_risks": len(risks),
                "critical_risks": sum(1 for r in risks if r.get("severity", "").lower() == "critical"),
                "high_risks": sum(1 for r in risks if r.get("severity", "").lower() == "high"),
                "medium_risks": sum(1 for r in risks if r.get("severity", "").lower() == "medium"),
                "low_risks": sum(1 for r in risks if r.get("severity", "").lower() == "low"),
                "legal_threats": 0, 
                "time_risks": 0,
                "complex_sentences": 0,
                "contract_dates": 0,
                "alternative_suggestions": 0,
                "tasks_completed": 5 
            }
            
            # Determine risk level
            score = data.get("risk_percentage", 0)
            if score >= 80: risk_level = "Critical"
            elif score >= 60: risk_level = "High"
            elif score >= 40: risk_level = "Medium"
            else: risk_level = "Low"
            
            report_item = {
                "id": risk_analysis.id,
                "document_id": doc.id,
                "document_name": doc.filename,
                "overall_risk_score": score,
                "risk_level": risk_level,
                "status": "completed",
                "created_at": risk_analysis.created_at.isoformat(),
                "summary": stats,
                "analysis_metadata": {
                    "total_words": 0, 
                    "confidence": data.get("confidence_percentage", 0) / 100.0,
                    "ai_model": risk_analysis.model_used or "Unknown",
                    "version": "1.0",
                    "analysis_system": risk_analysis.ai_provider or "Unknown"
                }
            }
            
            reports_data.append(report_item)
            
    return {
        "success": True,
        "data": {
            "reports": reports_data,
            "total_count": len(reports_data),
            "page": 1,
            "per_page": 100
        },
        "message": "Reports fetched successfully"
    }

@router.get("")
def get_user_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    documents = db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.upload_date.desc()).all()
    
    results = []
    for doc in documents:
        # Check analysis status
        analysis = db.query(AgentAnalysis).filter(AgentAnalysis.document_id == doc.id).first()
        status = "Uploaded"
        if analysis:
            if analysis.success:
                status = "Analyzed"
            else:
                status = "Processing"
        
        # Mock size or get from file
        size = 0
        try:
             if doc.file_path and os.path.exists(doc.file_path):
                 size = os.path.getsize(doc.file_path)
        except:
             pass

        results.append({
            "id": doc.id,
            "filename": doc.filename,
            "originalName": doc.filename,
            "upload_date": doc.upload_date,
            "createdAt": doc.upload_date,
            "size": size,
            "status": status,
            "file_path": doc.file_path,
            "extracted_text": doc.extracted_text
        })
        
    return results

@router.get("/{doc_id}")
def get_document_details(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    document = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Fetch Analysis Results
    analyses = db.query(AgentAnalysis).filter(AgentAnalysis.document_id == doc_id).all()
    
    # Fetch Latest Report
    report = db.query(Report).filter(Report.document_id == doc_id).order_by(Report.created_at.desc()).first()
    
    return {
        "document": document,
        "analyses": analyses,
        "report": report
    }

from fastapi import Response
import requests

@router.get("/{doc_id}/download")
async def download_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Download the original uploaded document file.
    """
    # Fetch the document and verify ownership
    document = db.query(Document).filter(
        Document.id == doc_id, 
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Check if file exists
    if not document.file_path or not os.path.exists(document.file_path):
        raise HTTPException(status_code=404, detail="Document file not found on server")
    
    # Determine media type based on file extension
    filename = document.filename
    media_type = "application/octet-stream"  # Default
    
    if filename.endswith('.pdf'):
        media_type = "application/pdf"
    elif filename.endswith('.docx'):
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    elif filename.endswith('.txt'):
        media_type = "text/plain"
    
    # Return the file
    return FileResponse(
        path=document.file_path,
        media_type=media_type,
        filename=filename,
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

@router.get("/{doc_id}/view")
async def view_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    View the original uploaded document file inline in the browser.
    Useful for PDFs and text files that can be rendered by the browser.
    """
    # Fetch the document and verify ownership
    document = db.query(Document).filter(
        Document.id == doc_id, 
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Check if file exists
    if not document.file_path or not os.path.exists(document.file_path):
        raise HTTPException(status_code=404, detail="Document file not found on server")
    
    # Determine media type based on file extension
    filename = document.filename
    media_type = "application/octet-stream"  # Default
    
    if filename.endswith('.pdf'):
        media_type = "application/pdf"
    elif filename.endswith('.docx'):
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    elif filename.endswith('.txt'):
        media_type = "text/plain"
    
    # Return the file with inline disposition to view in browser
    return FileResponse(
        path=document.file_path,
        media_type=media_type,
        filename=filename,
        headers={
            "Content-Disposition": f"inline; filename={filename}"
        }
    )


@router.post("/generate-clean-draft")
async def generate_clean_draft(
    request: dict,
    current_user: User = Depends(get_current_user)
):
    draft_url = os.getenv("DRAFT_AGENT_URL", "http://draft-agent:8003")
    try:
        # Forward the request to the draft agent
        # The draft agent expects: filename, analysis_results, apply_recommendations
        response = requests.post(f"{draft_url}/documents/generate-clean-draft", json=request, timeout=120)
        
        if response.status_code != 200:
             raise HTTPException(status_code=response.status_code, detail=f"Failed to generate draft: {response.text}")
        
        # Return the binary content (docx)
        return Response(
            content=response.content, 
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=improved_draft.docx"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from extraction.extractor import extract_text

# Individual Agent Processing Endpoints with Retry
@router.post("/{doc_id}/process/{agent_type}")
async def process_document_with_agent(
    doc_id: int,
    agent_type: Literal["clause", "risk", "summary", "draft"],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Process or retry processing a document with a specific agent.
    Returns the analysis result or error state.
    """
    # Verify document ownership
    document = db.query(Document).filter(
        Document.id == doc_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Ensure text is extracted
    if not document.extracted_text:
        try:
            # Check if file exists
            if not document.file_path or not os.path.exists(document.file_path):
                raise HTTPException(status_code=404, detail="Document file not found")
                
            text = extract_text(document.file_path)
            document.extracted_text = text
            db.commit()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to extract text from document: {str(e)}")
    
    # Agent URL mapping
    agent_urls = {
        "clause": os.getenv("CLAUSE_AGENT_URL", "http://clause-agent:8001"),
        "risk": os.getenv("RISK_AGENT_URL", "http://risk-agent:8002"),
        "summary": os.getenv("SUMMARY_AGENT_URL", "http://summary-agent:8004"),
        "draft": os.getenv("DRAFT_AGENT_URL", "http://draft-agent:8003")
    }
    
    agent_url = agent_urls.get(agent_type)
    if not agent_url:
        raise HTTPException(status_code=400, detail=f"Invalid agent type: {agent_type}")
    
    try:
        # Check if there's an existing analysis
        existing_analysis = db.query(AgentAnalysis).filter(
            AgentAnalysis.document_id == doc_id,
            AgentAnalysis.agent_type == agent_type
        ).order_by(AgentAnalysis.created_at.desc()).first()
        
        # Prepare request payload
        payload = {
            "text": document.extracted_text,
            "document_id": doc_id,
            "file_path": document.file_path,
            "filename": document.filename
        }
        
        # Call the agent service
        response = requests.post(
            f"{agent_url}/analyze",
            json=payload,
            timeout=120
        )
        
        # Parse response
        if response.status_code == 200:
            result_data = response.json()
            
            # Create or update analysis record
            if existing_analysis:
                existing_analysis.response = result_data
                existing_analysis.success = True
                existing_analysis.error = None
                existing_analysis.retry_count = (existing_analysis.retry_count or 0) + 1
                existing_analysis.model_used = result_data.get("model_used")
                existing_analysis.ai_provider = result_data.get("ai_provider")
            else:
                new_analysis = AgentAnalysis(
                    document_id=doc_id,
                    user_id=current_user.id,
                    agent_type=agent_type,
                    response=result_data,
                    success=True,
                    error=None,
                    retry_count=0,
                    model_used=result_data.get("model_used"),
                    ai_provider=result_data.get("ai_provider"),
                    extracted_text=document.extracted_text
                )
                db.add(new_analysis)
            
            db.commit()
            
            return {
                "success": True,
                "message": f"{agent_type.capitalize()} analysis completed successfully",
                "data": result_data,
                "agent_type": agent_type
            }
        else:
            # Handle error response
            error_message = f"{response.status_code} Server Error: {response.text}"
            
            # Update or create error record
            if existing_analysis:
                existing_analysis.success = False
                existing_analysis.error = error_message
                existing_analysis.retry_count = (existing_analysis.retry_count or 0) + 1
            else:
                new_analysis = AgentAnalysis(
                    document_id=doc_id,
                    user_id=current_user.id,
                    agent_type=agent_type,
                    response=None,
                    success=False,
                    error=error_message,
                    retry_count=0,
                    extracted_text=document.extracted_text
                )
                db.add(new_analysis)
            
            db.commit()
            
            raise HTTPException(
                status_code=response.status_code,
                detail=error_message
            )
            
    except requests.exceptions.Timeout:
        error_message = f"Timeout while processing with {agent_type} agent"
        
        if existing_analysis:
            existing_analysis.success = False
            existing_analysis.error = error_message
            existing_analysis.retry_count = (existing_analysis.retry_count or 0) + 1
        else:
            new_analysis = AgentAnalysis(
                document_id=doc_id,
                user_id=current_user.id,
                agent_type=agent_type,
                response=None,
                success=False,
                error=error_message,
                retry_count=0,
                extracted_text=document.extracted_text
            )
            db.add(new_analysis)
        
        db.commit()
        raise HTTPException(status_code=504, detail=error_message)
        
    except Exception as e:
        error_message = str(e)
        
        if existing_analysis:
            existing_analysis.success = False
            existing_analysis.error = error_message
            existing_analysis.retry_count = (existing_analysis.retry_count or 0) + 1
        else:
            new_analysis = AgentAnalysis(
                document_id=doc_id,
                user_id=current_user.id,
                agent_type=agent_type,
                response=None,
                success=False,
                error=error_message,
                retry_count=0,
                extracted_text=document.extracted_text
            )
            db.add(new_analysis)
        
        db.commit()
        raise HTTPException(status_code=500, detail=error_message)

@router.get("/{doc_id}/analysis/{agent_type}")
async def get_agent_analysis(
    doc_id: int,
    agent_type: Literal["clause", "risk", "summary", "draft"],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the latest analysis result for a specific agent.
    Returns the analysis data, error state, and retry information.
    """
    # Verify document ownership
    document = db.query(Document).filter(
        Document.id == doc_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Get latest analysis
    analysis = db.query(AgentAnalysis).filter(
        AgentAnalysis.document_id == doc_id,
        AgentAnalysis.agent_type == agent_type
    ).order_by(AgentAnalysis.created_at.desc()).first()
    
    if not analysis:
        return {
            "success": False,
            "message": "No analysis found for this agent",
            "data": None,
            "error": None,
            "retry_count": 0,
            "can_retry": True
        }
    
    return {
        "success": analysis.success,
        "message": "Analysis retrieved successfully" if analysis.success else "Analysis failed",
        "data": analysis.response if analysis.success else None,
        "error": analysis.error,
        "retry_count": analysis.retry_count or 0,
        "can_retry": not analysis.success,
        "model_used": analysis.model_used,
        "ai_provider": analysis.ai_provider,
        "created_at": analysis.created_at.isoformat()
    }
