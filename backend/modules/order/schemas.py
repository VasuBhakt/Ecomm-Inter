from pydantic import BaseModel, Field
from utils import UserDetails
from typing import Optional


class OrderAddRequest(BaseModel):
    product_id: str
    quantity: int


class OrderModifyRequest(BaseModel):
    quantity: int


class OrderResponse(BaseModel):
    id: str
    product_id: str
    quantity: int
    buyer_id: str
    status: str
    created_at: str
    updated_at: str
