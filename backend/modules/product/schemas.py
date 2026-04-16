from pydantic import BaseModel, Field
from utils import UserDetails
from typing import Optional


class ProductAddRequest(BaseModel):
    name: str = Field(min_length=3)
    description: str = Field(min_length=10, max_length=200)
    price: int = Field(gt=0)
    stock: int


class ProductModifyRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    stock: Optional[int] = None


class ProductResponse(BaseModel):
    id: str
    name: str
    description: str
    price: int
    stock: int
    seller_id: str
