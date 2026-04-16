from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from utils import APIException
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", None)],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "API IS UP!"}


@app.head("/")
async def root():
    return {"message": "Server is running"}


# Fix for the 404 Not Found (GET /healthcheck)
@app.get("/healthcheck")
async def health_check():
    return {"status": "ok"}


@app.exception_handler(APIException)
async def global_exception_handler(request: Request, exc: APIException):
    status = getattr(exc, "status", 500)
    message = getattr(exc, "message", "Internal Server Error")

    return JSONResponse(
        status_code=status,
        content={
            "success": False,
            "status": status,
            "message": message,
            "error_code": exc.error_code,
        },
    )
