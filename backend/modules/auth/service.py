from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from .schemas import SignupRequest, SigninResponse, JWTTokens, SigninRequest
from database import User, get_db
from utils import APIException, UserDetails
from .utils import AuthUtilService
import logging
import os
from datetime import datetime, timedelta
from fastapi import Request, Depends
import jwt
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self):
        self.util_service = AuthUtilService()

    async def signup(
        self, request: SignupRequest, db: AsyncSession = Depends(get_db)
    ) -> str:
        query = select(User).where(
            (User.email == request.email) | (User.username == request.username.lower())
        )
        result = await db.execute(query)
        existing_user = result.scalars().first()
        if existing_user:
            if existing_user.email == request.email:
                raise APIException(
                    message="Email already registered",
                    status=400,
                    error_code="EMAIL_EXISTS",
                )
            else:
                raise APIException(
                    message="Username already taken",
                    status=400,
                    error_code="USERNAME_EXISTS",
                )

        hashed_password = await self.util_service.hash_password(request.password)

        new_user = User(
            email=request.email,
            username=request.username.lower(),
            password=hashed_password,
            role=request.role,
        )
        try:
            db.add(new_user)
            await db.commit()
            await db.refresh(new_user)
            return "User created successfully. You can now signin"
        except Exception as e:
            await db.rollback()
            logger.error(f"Server error during signup: {e}")
            raise APIException(
                message="Failed to create user",
                status=500,
                error_code="INTERNAL_SERVER_ERROR",
            )

    async def signin(
        self, request: SigninRequest, db: AsyncSession = Depends(get_db)
    ) -> SigninResponse:
        query = select(User).where(
            (User.email == request.identifier)
            | (User.username == request.identifier.lower())
        )
        result = await db.execute(query)
        user = result.scalars().first()
        if not user:
            raise APIException(
                message="User not found",
                status=404,
                error_code="USER_NOT_FOUND",
            )
        is_password_correct = await self.util_service.verify_password(
            request.password, user.password
        )
        if not is_password_correct:
            raise APIException(
                message="Invalid password", status=401, error_code="INVALID_PASSWORD"
            )
        user_response = UserDetails(
            id=user.id,
            username=user.username,
            role=user.role if isinstance(user.role, str) else user.role.value,
            email=user.email,
        )
        tokens = self.util_service.generate_access_and_refresh_tokens(user_response)
        user.refresh_token = self.util_service.hash_token(tokens.refresh_token)

        try:
            db.add(user)
            await db.commit()
            await db.refresh(user)
            return SigninResponse(tokens=tokens, user_details=user_response)

        except Exception as e:
            await db.rollback()
            logger.error(f"Server error during signin: {e}")
            raise APIException(
                message="An error occurred while logging in",
                status=500,
                error_code="SERVER_ERROR",
            )

    # signout
    async def signout(
        self,
        user_id: str,
        db: AsyncSession = Depends(get_db),
    ) -> str:

        query = select(User).where(User.id == user_id)
        result = await db.execute(query)
        user = result.scalars().first()
        if not user:
            raise APIException(
                message="User not found", status=404, error_code="USER_NOT_FOUND"
            )
        user.refresh_token = None
        try:
            db.add(user)
            await db.commit()
            await db.refresh(user)
        except Exception as e:
            await db.rollback()
            logger.error(f"Database error during signout: {e}")
            raise APIException(
                message="An error occurred while logging out",
                status=500,
                error_code="SERVER_ERROR",
            )
        return "Signout successful"

    # refresh access token
    async def refresh_access_token(
        self, request: Request, db: AsyncSession = Depends(get_db)
    ) -> JWTTokens:
        token = request.cookies.get("refresh_token")
        if not token:
            raise APIException(
                message="Refresh token not found",
                status=401,
                error_code="REFRESH_TOKEN_NOT_FOUND",
            )
        decoded_token = jwt.decode(
            token,
            os.getenv("JWT_REFRESH_SECRET", "hello"),
            algorithms=["HS256"],
        )
        user_id = decoded_token.get("id")
        if not user_id:
            raise APIException(
                "Unauthorized, id not present",
                status=401,
                error_code="UNAUTHORIZED",
            )
        query = select(User).where(User.id == user_id)
        result = await db.execute(query)
        user = result.scalars().first()
        if not user:
            raise APIException(
                "Unauthorized, invalid user id",
                status=401,
                error_code="UNAUTHORIZED",
            )
        hashed_token = self.util_service.hash_token(token)
        if user.refresh_token != hashed_token:
            raise APIException(
                "Unauthorized, invalid refresh token",
                status=401,
                error_code="UNAUTHORIZED",
            )
        user_response = UserDetails(
            id=user.id,
            username=user.username,
            role=user.role if isinstance(user.role, str) else user.role.value,
            email=user.email,
        )
        tokens = self.util_service.generate_access_and_refresh_tokens(user_response)
        user.refresh_token = self.util_service.hash_token(tokens.refresh_token)
        try:
            db.add(user)
            await db.commit()
            await db.refresh(user)
        except Exception as e:
            await db.rollback()
            logger.error(f"Database error during refresh access token: {e}")
            raise APIException(
                message="An error occurred while refreshing access token",
                status=500,
                error_code="SERVER_ERROR",
            )
        return tokens

    async def delete_account(
        self, user_id: str, db: AsyncSession = Depends(get_db)
    ) -> str:
        query = select(User).where(User.id == user_id)
        result = await db.execute(query)
        user = result.scalars().first()
        if not user:
            raise APIException(
                "User not found", status=404, error_code="USER_NOT_FOUND"
            )
        try:
            await db.delete(user)
            await db.commit()
        except Exception as e:
            await db.rollback()
            logger.error(f"Database error during delete account: {e}")
            raise APIException(
                message="An error occurred while deleting account",
                status=500,
                error_code="SERVER_ERROR",
            )
        return "Account deleted successfully"
