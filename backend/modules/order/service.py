from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from .schemas import OrderAddRequest, OrderModifyRequest, OrderResponse
from database import Order, Product, get_db
from utils import APIException
import logging
import os
from datetime import datetime, timedelta
from fastapi import Request, Depends
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class OrderService:
    async def add_order(
        self,
        request: OrderAddRequest,
        buyer_id: str,
        db: AsyncSession = Depends(get_db),
    ) -> str:
        query = select(Product).where(Product.id == request.product_id)
        result = await db.execute(query)
        product = result.scalar_one_or_none()
        if not product:
            raise APIException(
                "Product not found", status=404, error_code="PRODUCT_NOT_FOUND"
            )
        if product.stock < request.quantity:
            raise APIException(
                "Insufficient stock", status=400, error_code="INSUFFICIENT_STOCK"
            )
        product.stock -= request.quantity
        total_amount = product.price * request.quantity
        new_order = Order(
            product_id=request.product_id,
            quantity=request.quantity,
            buyer_id=buyer_id,
            status="pending",
            total_amount=total_amount,
        )
        try:
            db.add(new_order)
            db.add(product)
            await db.commit()
            await db.refresh(new_order)
            return "Order added successfully"
        except Exception as e:
            await db.rollback()
            raise APIException(
                "Failed to add order", status=500, error_code="ORDER_ADD_FAILED"
            )

    async def modify_order(
        self,
        request: OrderModifyRequest,
        buyer_id: str,
        order_id: str,
        db: AsyncSession = Depends(get_db),
    ) -> str:
        query = select(Order).where(Order.id == order_id, Order.buyer_id == buyer_id)
        result = await db.execute(query)
        order = result.scalar_one_or_none()
        if not order:
            raise APIException(
                "Order not found", status=404, error_code="ORDER_NOT_FOUND"
            )
        if request.quantity:
            query = select(Product).where(Product.id == order.product_id)
            result = await db.execute(query)
            product = result.scalar_one_or_none()
            if not product:
                raise APIException(
                    "Product not found", status=404, error_code="PRODUCT_NOT_FOUND"
                )
            product.stock += order.quantity
            if product.stock < request.quantity:
                raise APIException(
                    "Insufficient stock", status=400, error_code="INSUFFICIENT_STOCK"
                )
            product.stock -= request.quantity
            order.quantity = request.quantity
            order.total_amount = product.price * request.quantity
            db.add(product)
        try:
            db.add(order)
            await db.commit()
            await db.refresh(order)
            if request.quantity:
                await db.refresh(product)
            return "Order modified successfully"
        except Exception as e:
            await db.rollback()
            logger.error(f"Error modifying order: {e}")
            raise APIException(
                "Failed to modify order",
                status=500,
                error_code="ORDER_MODIFY_FAILED",
            )

    async def delete_order(
        self,
        buyer_id: str,
        order_id: str,
        db: AsyncSession = Depends(get_db),
    ) -> str:
        query = select(Order).where(Order.id == order_id, Order.buyer_id == buyer_id)
        result = await db.execute(query)
        order = result.scalar_one_or_none()
        if not order:
            raise APIException(
                "Order not found", status=404, error_code="ORDER_NOT_FOUND"
            )
        if order.status != "pending":
            raise APIException(
                "Order cannot be cancelled",
                status=400,
                error_code="ORDER_DELETE_FAILED",
            )
        query = select(Product).where(Product.id == order.product_id)
        result = await db.execute(query)
        product = result.scalar_one_or_none()
        if not product:
            raise APIException(
                "Product not found", status=404, error_code="PRODUCT_NOT_FOUND"
            )
        product.stock += order.quantity
        try:
            await db.add(product)
            await db.delete(order)
            await db.commit()
            await db.refresh(product)
            return "Order deleted successfully"
        except Exception as e:
            await db.rollback()
            raise APIException(
                "Failed to delete order",
                status=500,
                error_code="ORDER_DELETE_FAILED",
            )

    async def get_order(
        self,
        buyer_id: str,
        order_id: str,
        db: AsyncSession = Depends(get_db),
    ) -> OrderResponse:
        query = (
            select(Order, Product.name.label("product_name"))
            .join(Product, Order.product_id == Product.id)
            .where(Order.id == order_id, Order.buyer_id == buyer_id)
        )
        result = await db.execute(query)
        row = result.one_or_none()
        if not row:
            raise APIException(
                "Order not found", status=404, error_code="ORDER_NOT_FOUND"
            )
        return OrderResponse(
            id=row.Order.id,
            product_id=row.Order.product_id,
            product_name=row.product_name,
            quantity=row.Order.quantity,
            total_amount=row.Order.total_amount,
            buyer_id=row.Order.buyer_id,
            status=row.Order.status,
            created_at=row.Order.created_at,
            updated_at=row.Order.updated_at,
        )

    async def get_all_orders_by_buyer(
        self,
        buyer_id: str,
        page: int = 1,
        limit: int = 10,
        db: AsyncSession = Depends(get_db),
    ) -> list[OrderResponse]:
        query = (
            select(Order, Product.name.label("product_name"))
            .join(Product, Order.product_id == Product.id)
            .where(Order.buyer_id == buyer_id)
            .offset((page - 1) * limit)
            .limit(limit)
        )
        result = await db.execute(query)
        rows = result.all()
        return [
            OrderResponse(
                id=row.Order.id,
                product_id=row.Order.product_id,
                product_name=row.product_name,
                quantity=row.Order.quantity,
                total_amount=row.Order.total_amount,
                buyer_id=row.Order.buyer_id,
                status=row.Order.status,
                created_at=row.Order.created_at,
                updated_at=row.Order.updated_at,
            )
            for row in rows
        ]
