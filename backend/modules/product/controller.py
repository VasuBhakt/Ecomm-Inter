from fastapi import APIRouter, Depends, Response, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from .schemas import ProductAddRequest, ProductModifyRequest
from .service import ProductService
from utils import APIResponse, DependenciesService, APIException

product_router = APIRouter(prefix="/product", tags=["Product"])


def get_product_service():
    return ProductService()


def get_dependencies_service():
    return DependenciesService()


@product_router.post("/add")
async def add_product(
    prod_request: ProductAddRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    product_service: ProductService = Depends(get_product_service),
    auth_check: str = Depends(get_dependencies_service().verifyJWT),
) -> APIResponse:
    if not request.state.user:
        raise APIException(
            "Unauthorized",
            status=401,
            error_code="UNAUTHORIZED",
        )
    if not request.state.user.role == "seller":
        raise APIException(
            "Unauthorized to Sell Products",
            status=401,
            error_code="UNAUTHORIZED",
        )
    message = await product_service.add_product(prod_request, request.state.user.id, db)
    return APIResponse(message=message, status=201)


@product_router.patch("/modify/{product_id}")
async def modify_product(
    prod_request: ProductModifyRequest,
    request: Request,
    product_id: str,
    db: AsyncSession = Depends(get_db),
    product_service: ProductService = Depends(get_product_service),
    auth_check: str = Depends(get_dependencies_service().verifyJWT),
) -> APIResponse:
    if not request.state.user:
        raise APIException(
            "Unauthorized",
            status=401,
            error_code="UNAUTHORIZED",
        )
    message = await product_service.modify_product(
        prod_request, request.state.user.id, product_id, db
    )
    return APIResponse(message=message, status=200)


@product_router.delete("/delete/{product_id}")
async def delete_product(
    request: Request,
    product_id: str,
    db: AsyncSession = Depends(get_db),
    product_service: ProductService = Depends(get_product_service),
    auth_check: str = Depends(get_dependencies_service().verifyJWT),
) -> APIResponse:
    if not request.state.user:
        raise APIException(
            "Unauthorized",
            status=401,
            error_code="UNAUTHORIZED",
        )
    message = await product_service.delete_product(
        request.state.user.id, product_id, db
    )
    return APIResponse(message=message, status=200)


@product_router.get("/{product_id}")
async def get_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    product_service: ProductService = Depends(get_product_service),
) -> APIResponse:
    product = await product_service.get_product(product_id, db)
    return APIResponse(message="Product fetched successfully", data=product, status=200)


@product_router.get("/")
async def get_all_products(
    db: AsyncSession = Depends(get_db),
    product_service: ProductService = Depends(get_product_service),
) -> APIResponse:
    products = await product_service.get_all_products(db)
    return APIResponse(
        message="Products fetched successfully", data=products, status=200
    )


@product_router.get("/seller/{seller_id}")
async def get_products_by_seller(
    seller_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    product_service: ProductService = Depends(get_product_service),
) -> APIResponse:
    products = await product_service.get_products_by_seller(seller_id, page, limit, db)
    return APIResponse(
        message="Products fetched successfully", data=products, status=200
    )
