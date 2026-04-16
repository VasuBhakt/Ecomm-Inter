from dotenv import load_dotenv
from contextlib import asynccontextmanager
import os
import sys
import uvicorn
import logging

load_dotenv()

from app import app
from database import engine


@asynccontextmanager
async def lifespan(app):
    try:
        async with engine.connect() as connection:
            print("Successfully connected to NeonDB!")
        yield
    except Exception as e:
        print(f"Database connection failed: {e}")
        raise e


app.router.lifespan_context = lifespan

if __name__ == "__main__":
    port = int(os.getenv("PORT", 10000))
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST"),
        port=port,
        reload=False,
        log_level="info",
    )
