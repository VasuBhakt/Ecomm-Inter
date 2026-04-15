from datetime import datetime
from enum import Enum
from uuid import uuid4
from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    Date,
    Boolean,
    Index,
    Enum as SQLEnum,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


# Helper for UUID strings
def generate_uuid():
    return str(uuid4())


class Role(str, Enum):
    BUYER = "buyer"
    SELLER = "seller"


class OrderStatus(str, Enum):
    PENDING = "pending"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(SQLEnum(Role), default=Role.BUYER)
    verification_token = Column(String, index=True, nullable=True)
    is_verified = Column(Boolean, default=False)
    verify_token_expiry = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("idx_is_verified_expiry", "is_verified", "verify_token_expiry"),
    )
    # Relationships
    products = relationship(
        "Product", back_populates="seller", cascade="all, delete-orphan"
    )
    orders = relationship("Order", back_populates="buyer", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "products"
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    seller_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    price = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (Index("idx_seller_id", "seller_id"),)

    seller = relationship("User", back_populates="products")
    orders = relationship("Order", back_populates="product")


class Order(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    buyer_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    product_id = Column(String, ForeignKey("products.id", ondelete="CASCADE"))
    quantity = Column(Integer, nullable=False)
    total_amount = Column(Integer, nullable=False)
    status = Column(SQLEnum(OrderStatus), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("idx_buyer_id", "buyer_id"),
        Index("idx_product_id", "product_id"),
        Index("idx_status", "status"),
    )

    buyer = relationship("User", back_populates="orders")
    product = relationship("Product", back_populates="orders")
