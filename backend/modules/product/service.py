from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from .schemas import ProductAddRequest, ProductModifyRequest, ProductResponse
from database import Product, get_db
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


class ProductService:

    async def add_product(
        self,
        request: ProductAddRequest,
        seller_id: str,
        db: AsyncSession = Depends(get_db),
    ) -> str:
        new_product = ProductResponse(
            name=request.name,
            description=request.description,
            price=request.price,
            stock=request.stock,
            seller_id=seller_id,
        )
        try:
            db.add(new_product)
            await db.commit()
            await db.refresh(new_product)
            return "Product added successfully"
        except Exception as e:
            await db.rollback()
            raise APIException(
                "Failed to add product", status=500, error_code="PRODUCT_ADD_FAILED"
            )

    async def modify_product(
        self,
        request: ProductModifyRequest,
        seller_id: str,
        product_id: str,
        db: AsyncSession = Depends(get_db),
    ) -> str:
        query = select(Product).where(
            Product.id == product_id, Product.seller_id == seller_id
        )
        result = await db.execute(query)
        product = result.scalar_one_or_none()
        if not product:
            raise APIException(
                "Product not found", status=404, error_code="PRODUCT_NOT_FOUND"
            )
        if request.name:
            product.name = request.name
        if request.description:
            product.description = request.description
        if request.price:
            product.price = request.price
        if request.stock:
            product.stock = request.stock
        try:
            await db.commit()
            await db.refresh(product)
            return "Product modified successfully"
        except Exception as e:
            await db.rollback()
            raise APIException(
                "Failed to modify product",
                status=500,
                error_code="PRODUCT_MODIFY_FAILED",
            )

    async def delete_product(
        self,
        seller_id: str,
        product_id: str,
        db: AsyncSession = Depends(get_db),
    ) -> str:
        query = select(Product).where(
            Product.id == product_id, Product.seller_id == seller_id
        )
        result = await db.execute(query)
        product = result.scalar_one_or_none()
        if not product:
            raise APIException(
                "Product not found", status=404, error_code="PRODUCT_NOT_FOUND"
            )
        try:
            await db.delete(product)
            await db.commit()
            return "Product deleted successfully"
        except Exception as e:
            await db.rollback()
            raise APIException(
                "Failed to delete product",
                status=500,
                error_code="PRODUCT_DELETE_FAILED",
            )

    async def get_product(
        self,
        product_id: str,
        db: AsyncSession = Depends(get_db),
    ) -> ProductResponse:
        query = select(Product).where(Product.id == product_id)
        result = await db.execute(query)
        product = result.scalar_one_or_none()
        if not product:
            raise APIException(
                "Product not found", status=404, error_code="PRODUCT_NOT_FOUND"
            )
        return ProductResponse(
            id=product.id,
            name=product.name,
            description=product.description,
            price=product.price,
            stock=product.stock,
            seller_id=product.seller_id,
        )

    async def get_all_products(
        self, db: AsyncSession = Depends(get_db)
    ) -> list[ProductResponse]:
        query = select(Product)
        result = await db.execute(query)
        products = result.scalars().all()
        return [
            ProductResponse(
                id=product.id,
                name=product.name,
                description=product.description,
                price=product.price,
                stock=product.stock,
                seller_id=product.seller_id,
            )
            for product in products
        ]

    async def get_products_by_seller(
        self,
        seller_id: str,
        db: AsyncSession = Depends(get_db),
    ) -> list[ProductResponse]:
        query = select(Product).where(Product.seller_id == seller_id)
        result = await db.execute(query)
        products = result.scalars().all()
        return [
            ProductResponse(
                id=product.id,
                name=product.name,
                description=product.description,
                price=product.price,
                stock=product.stock,
                seller_id=product.seller_id,
            )
            for product in products
        ]

    async def is_product_owner(
        self, seller_id: str, product_id: str, db: AsyncSession = Depends(get_db)
    ) -> bool:
        query = select(Product).where(
            Product.id == product_id, Product.seller_id == seller_id
        )
        result = await db.execute(query)
        product = result.scalar_one_or_none()
        return product is not None
