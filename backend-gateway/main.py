from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
from database.db import engine, Base
from auth import router as auth_router
from documents import router as documents_router
from processing import router as processing_router
from dashboard import router as dashboard_router
from analytics import router as analytics_router

# Configure logging
logging.basicConfig(
    filename='logs/app.log',
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Legal Document Assistance Backend",
    description="Gateway for Legal Document Processing System",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(documents_router.router)
app.include_router(processing_router.router)
app.include_router(dashboard_router.router)
app.include_router(analytics_router.router)

@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {"message": "Legal Document Assistance Gateway is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
