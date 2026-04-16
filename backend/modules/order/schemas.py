from pydantic import BaseModel, Field
from utils import UserDetails
from typing import Optional
from datetime import datetime


class OrderAddRequest(BaseModel):
    product_id: str
    quantity: int


class OrderModifyRequest(BaseModel):
    quantity: Optional[int] = None


class OrderResponse(BaseModel):
    id: str
    product_id: str
    quantity: int
    buyer_id: str
    status: str
    created_at: datetime
    updated_at: datetime
