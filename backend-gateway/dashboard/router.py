from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Dict, Any
from datetime import datetime, timedelta
from database.db import get_db
from documents.models import Document, AgentAnalysis, Report
from auth.auth_service import get_current_user
from auth.models import User

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"]
)

@router.get("/real-time-stats")
def get_real_time_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Total Documents
    total_documents = db.query(Document).filter(Document.user_id == current_user.id).count()

    # 2. Recent Uploads (last 24 hours)
    twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
    recent_uploads_count = db.query(Document).filter(
        Document.user_id == current_user.id,
        Document.upload_date >= twenty_four_hours_ago
    ).count()

    # 3. All Reports (Downloaded/Generated)
    all_reports_count = db.query(Report).filter(Report.user_id == current_user.id).count()

    # 4. Analysis History (Completed Analyses)
    analysis_history_count = db.query(AgentAnalysis).filter(
        AgentAnalysis.user_id == current_user.id,
        AgentAnalysis.success == True
    ).count()

    # 5. Recent Uploads List (Top 5)
    recent_docs = db.query(Document).filter(Document.user_id == current_user.id)\
        .order_by(desc(Document.upload_date))\
        .limit(5)\
        .all()
    
    recent_uploads_list = []
    for doc in recent_docs:
        # Determine status based on analysis
        # Check if any analysis exists
        analysis = db.query(AgentAnalysis).filter(AgentAnalysis.document_id == doc.id).first()
        status = "Uploaded"
        if analysis:
            if analysis.success:
                status = "Analyzed"
            else:
                status = "Processing" # or Failed
        
        recent_uploads_list.append({
            "id": doc.id,
            "document_name": doc.filename,
            "uploaded_at": doc.upload_date.isoformat(),
            "size": 1024 * 10, # Mock size 10KB as it is not in DB
            "status": status
        })

    # 6. All Reports List (Top 5 Risk Analyses)
    # We want to show risk level and percentage.
    recent_analyses = db.query(AgentAnalysis).filter(
        AgentAnalysis.user_id == current_user.id,
        AgentAnalysis.agent_type == 'risk',
        AgentAnalysis.success == True
    ).order_by(desc(AgentAnalysis.created_at)).limit(5).all()

    all_reports_list = []
    for analysis in recent_analyses:
        data = analysis.response or {}
        risk_score = data.get('risk_score', 0)
        # Determine level
        level = "low"
        if risk_score > 80:
            level = "critical"
        elif risk_score > 60:
            level = "high"
        elif risk_score > 40:
            level = "medium"
        
        doc_name = "Unknown Document"
        if analysis.document:
            doc_name = analysis.document.filename

        all_reports_list.append({
            "id": analysis.id, # Use analysis ID as report ID for list
            "document_name": doc_name,
            "risk_level": level,
            "risk_percentage": risk_score,
            "created_at": analysis.created_at.isoformat(),
            "status": "Completed"
        })

    return {
        "success": True,
        "data": {
            "total_documents": total_documents,
            "recent_uploads": recent_uploads_count,
            "all_reports": all_reports_count,
            "analysis_history": analysis_history_count,
            "recent_uploads_list": recent_uploads_list,
            "all_reports_list": all_reports_list,
            "system_status": {
                "all_systems_operational": True,
                "available_features": 5,
                "total_features": 5,
                "capabilities": {
                    "enhanced_agent_v2": True,
                    "export_agent": True,
                    "replacement_agent": True,
                    "hybrid_agent": True,
                    "help_bot": True
                }
            }
        }
    }
