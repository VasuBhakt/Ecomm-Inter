from typing import Optional, TypeVar, Generic
from pydantic import BaseModel

T = TypeVar("T")

class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    status: int = 200
    message: str = "Success"
    data: Optional[T] = None
