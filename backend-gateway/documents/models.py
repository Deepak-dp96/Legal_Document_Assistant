from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database.db import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    file_path = Column(String)
    upload_date = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    extracted_text = Column(Text, nullable=True)
    
    user = relationship("auth.models.User")

from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Boolean

class AgentAnalysis(Base):
    __tablename__ = "agent_analysis"

    id = Column(Integer, primary_key=True, index=True)
    agent_type = Column(String, index=True) # clause, risk, draft, summary
    response = Column(JSONB, nullable=True) # The JSON response from AI
    success = Column(Boolean, default=False)
    error = Column(String, nullable=True)
    meta_data = Column(JSONB, nullable=True)
    extracted_text = Column(Text, nullable=True)
    
    # AI Traceability fields
    model_used = Column(String, nullable=True)  # e.g., gemini-1.5-pro
    retry_count = Column(Integer, default=0)
    ai_provider = Column(String, nullable=True)  # gemini or groq
    
    user_id = Column(Integer, ForeignKey("users.id"))
    document_id = Column(Integer, ForeignKey("documents.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("auth.models.User")
    document = relationship("Document")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    agent_type = Column(String, nullable=True) # clause, risk, draft, summary, or null for combined
    file_path = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document")
    user = relationship("auth.models.User")
