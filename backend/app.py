import os
import uvicorn
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import sys

load_dotenv()

from database import engine


@asynccontextmanager
async def lifespan(app):
    try:
        async with engine.connect() as connection:
            logger.info("Successfully connected to NeonDB!")
        yield
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise e


app.router.lifespan_context = lifespan

if __name__ == "__main__":
    port = int(os.getenv("PORT", 10000))
    logger.info(f"Server running on port {port}")
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST"),
        port=port,
        reload=False,
        log_level="info",
    )
