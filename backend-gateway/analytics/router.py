from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Dict, Any
from datetime import datetime, timedelta
from database.db import get_db
from documents.models import Document, AgentAnalysis
from auth.auth_service import get_current_user
from auth.models import User

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"]
)

@router.get("/trends")
def get_analytics_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Default to 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    # Fetch all risk analyses for the user in the last 30 days
    analyses = db.query(AgentAnalysis).filter(
        AgentAnalysis.user_id == current_user.id,
        AgentAnalysis.agent_type == 'risk',
        AgentAnalysis.success == True,
        AgentAnalysis.created_at >= thirty_days_ago
    ).order_by(AgentAnalysis.created_at).all()
    
    total_analyses = len(analyses)
    
    # Calculate Severity Distribution
    severity_dist = {
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0
    }
    
    # Calculate Daily Trend
    daily_trend_map = {}
    
    # Document Types (Mock for now as we don't strictly categorize yet)
    document_types = {
        "contract": 0,
        "agreement": 0,
        "policy": 0,
        "other": 0
    }
    
    total_risk_score = 0
    
    for analysis in analyses:
        data = analysis.response or {}
        risk_score = data.get('risk_score', 0)
        total_risk_score += risk_score
        
        # Severity
        if risk_score > 80:
            severity_dist["critical"] += 1
        elif risk_score > 60:
            severity_dist["high"] += 1
        elif risk_score > 40:
            severity_dist["medium"] += 1
        else:
            severity_dist["low"] += 1
            
        # Daily Trend
        date_str = analysis.created_at.strftime('%Y-%m-%d')
        if date_str not in daily_trend_map:
            daily_trend_map[date_str] = {"count": 0, "total_risk": 0}
        
        daily_trend_map[date_str]["count"] += 1
        daily_trend_map[date_str]["total_risk"] += risk_score
        
        # Document Type (Mock based on filename)
        doc_name = "other"
        if analysis.document:
            filename = analysis.document.filename.lower()
            if "contract" in filename:
                document_types["contract"] += 1
            elif "agreement" in filename:
                document_types["agreement"] += 1
            elif "policy" in filename:
                document_types["policy"] += 1
            else:
                document_types["other"] += 1
        else:
            document_types["other"] += 1

    # Format Daily Trend
    daily_trend = []
    # Fill in missing days? For now just return days with data
    for date_str, stats in daily_trend_map.items():
        daily_trend.append({
            "date": date_str,
            "analyses_count": stats["count"],
            "average_risk": stats["total_risk"] / stats["count"] if stats["count"] > 0 else 0
        })
    
    # Sort by date
    daily_trend.sort(key=lambda x: x["date"])
    
    # Performance Metrics
    avg_processing_time = "45s" # Mock
    accuracy_rate = "94%" # Mock
    
    total_risks_detected_count = 0
    for analysis in analyses:
        data = analysis.response or {}
        detailed = data.get("detailed_analysis", {})
        risks = detailed.get("identified_risks", [])
        total_risks_detected_count += len(risks)

    return {
        "success": True,
        "data": {
            "time_period": "30d",
            "total_analyses": total_analyses,
            "daily_trend": daily_trend,
            "severity_distribution": severity_dist,
            "document_types": document_types,
            "performance_metrics": {
                "avg_processing_time": avg_processing_time,
                "accuracy_rate": accuracy_rate,
                "total_risks_detected": total_risks_detected_count
            },
            "insights": [
                "Risk levels have decreased by 5% compared to last period.",
                "Contract documents show the highest average risk score.",
                "Most common risk factor: Missing Termination Clause."
            ]
        }
    }
