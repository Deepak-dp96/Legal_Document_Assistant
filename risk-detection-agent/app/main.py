from fastapi import FastAPI
import logging
from app.routes import router

# Configure logging
logging.basicConfig(
    filename='logs/app.log',
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Risk Detection Agent")

app.include_router(router.router)

@app.get("/health")
async def health():
    return {"status": "healthy"}
