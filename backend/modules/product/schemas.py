from pydantic import BaseModel, Field
from utils import UserDetails
from typing import Optional


class ProductAddRequest(BaseModel):
    name: str = Field(min_length=3)
    description: str = Field(min_length=5, max_length=1000)
    price: float = Field(gt=0)
    stock: int = Field(ge=0)


class ProductModifyRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=3)
    description: Optional[str] = Field(None, min_length=5, max_length=1000)
    price: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)


class ProductResponse(BaseModel):
    id: str
    name: str
    description: str
    price: int
    stock: int
    seller_id: str
