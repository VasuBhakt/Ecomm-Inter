from passlib.context import CryptContext
from fastapi.concurrency import run_in_threadpool
from fastapi import Response
import secrets
import hashlib
import hmac
from .schemas import JWTTokens, Token
from utils import UserDetails
import jwt
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


class AuthUtilService:
    async def hash_password(self, password: str) -> str:
        # Hash is CPU intensive, run in threadpool to avoid blocking event loop
        return await run_in_threadpool(pwd_context.hash, password)

    async def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return await run_in_threadpool(
            pwd_context.verify, plain_password, hashed_password
        )

    def generate_token(self, length: int = 32) -> Token:
        token = secrets.token_hex(length)
        hashed_token = self.hash_token(token)
        return Token(raw_token=token, hashed_token=hashed_token)

    def generate_access_and_refresh_tokens(self, user: UserDetails) -> JWTTokens:
        access_token_payload = {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "exp": datetime.utcnow() + timedelta(hours=1),
        }
        refresh_token_payload = {
            "id": user.id,
            "exp": datetime.utcnow() + timedelta(days=7),
        }
        access_token = jwt.encode(
            access_token_payload,
            os.getenv("JWT_ACCESS_SECRET", "hello"),
            algorithm="HS256",
        )
        refresh_token = jwt.encode(
            refresh_token_payload,
            os.getenv("JWT_REFRESH_SECRET", "hello"),
            algorithm="HS256",
        )
        return JWTTokens(access_token=access_token, refresh_token=refresh_token)

    def set_auth_cookies(
        self,
        response: Response,
        tokens: JWTTokens,
        access_token_max_age: int = 60 * 60,  # 1 hour
        refresh_token_max_age: int = 7 * 24 * 60 * 60,  # 7 days
    ):
        response.set_cookie(
            key="access_token",
            value=tokens.access_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=access_token_max_age,
        )
        response.set_cookie(
            key="refresh_token",
            value=tokens.refresh_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=refresh_token_max_age,
        )

    def hash_token(self, token: str) -> str:
        return hashlib.sha256(token.encode()).hexdigest()
