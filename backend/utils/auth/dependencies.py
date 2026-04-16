from fastapi import Request, Depends
from database import User, get_db
from .schema import UserDetails
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from utils import APIException
import jwt
import os
from dotenv import load_dotenv

load_dotenv()


class DependenciesService:
    async def verifyJWT(
        self, request: Request, db: AsyncSession = Depends(get_db)
    ) -> str:
        token = request.cookies.get("access_token")
        if not token:
            raise APIException("Unauthorized", status=401, error_code="UNAUTHORIZED")
        try:
            decoded_token = jwt.decode(
                token, os.getenv("JWT_ACCESS_SECRET", "hello"), algorithms=["HS256"]
            )
            user_id = decoded_token.get("id")

            if not user_id:
                raise APIException(
                    "Unauthorized, id not present",
                    status=401,
                    error_code="UNAUTHORIZED",
                )

            # Async query
            query = select(User).where(User.id == user_id)
            result = await db.execute(query)
            user = result.scalars().first()

            if not user:
                raise APIException(
                    "Unauthorized, invalid user id",
                    status=401,
                    error_code="UNAUTHORIZED",
                )

            request.state.user = UserDetails(
                id=user.id,
                username=user.username,
                role=user.role if isinstance(user.role, str) else user.role.value,
                email=user.email,
            )
            return "Authorized"
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            raise APIException(
                "Unauthorized, invalid token", status=401, error_code="UNAUTHORIZED"
            )
