from fastapi import APIRouter, Depends, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from .schemas import OrderAddRequest, OrderModifyRequest, OrderResponse
from .service import OrderService
from utils import DependenciesService, APIResponse, APIException

order_router = APIRouter(prefix="/order", tags=["Order"])


def get_order_service():
    return OrderService()


def get_dependencies_service():
    return DependenciesService()


@order_router.post("/add")
async def add_order(
    order_request: OrderAddRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    order_service: OrderService = Depends(get_order_service),
    dependencies_service: DependenciesService = Depends(
        get_dependencies_service().verifyJWT
    ),
) -> APIResponse:
    if not request.state.user:
        raise APIException(
            "Unauthorized",
            status=401,
            error_code="UNAUTHORIZED",
        )
    if not request.state.user.role == "buyer":
        raise APIException(
            "Unauthorized to Buy Products",
            status=401,
            error_code="UNAUTHORIZED",
        )
    message = await order_service.add_order(order_request, request.state.user.id, db)
    return APIResponse(message=message, status=201)


@order_router.patch("/modify/{order_id}")
async def modify_order(
    order_id: str,
    order_request: OrderModifyRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    order_service: OrderService = Depends(get_order_service),
    dependencies_service: DependenciesService = Depends(
        get_dependencies_service().verifyJWT
    ),
) -> APIResponse:
    if not request.state.user:
        raise APIException(
            "Unauthorized",
            status=401,
            error_code="UNAUTHORIZED",
        )
    message = await order_service.modify_order(
        order_request, request.state.user.id, order_id, db
    )
    return APIResponse(message=message, status=200)


@order_router.delete("/delete/{order_id}")
async def delete_order(
    order_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    order_service: OrderService = Depends(get_order_service),
    dependencies_service: DependenciesService = Depends(
        get_dependencies_service().verifyJWT
    ),
) -> APIResponse:
    if not request.state.user:
        raise APIException(
            "Unauthorized",
            status=401,
            error_code="UNAUTHORIZED",
        )
    message = await order_service.delete_order(request.state.user.id, order_id, db)
    return APIResponse(message=message, status=200)


@order_router.get("/{order_id}")
async def get_order(
    order_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    order_service: OrderService = Depends(get_order_service),
    dependencies_service: DependenciesService = Depends(
        get_dependencies_service().verifyJWT
    ),
) -> APIResponse:
    if not request.state.user:
        raise APIException(
            "Unauthorized",
            status=401,
            error_code="UNAUTHORIZED",
        )
    order = await order_service.get_order(request.state.user.id, order_id, db)
    return APIResponse(message="Order fetched successfully", data=order, status=200)


@order_router.get("/buyer/{buyer_id}")
async def get_orders_by_buyer(
    buyer_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    order_service: OrderService = Depends(get_order_service),
    dependencies_service: DependenciesService = Depends(
        get_dependencies_service().verifyJWT
    ),
) -> APIResponse:
    if not request.state.user:
        raise APIException(
            "Unauthorized",
            status=401,
            error_code="UNAUTHORIZED",
        )
    orders = await order_service.get_orders_by_buyer(request.state.user.id, db)
    return APIResponse(message="Orders fetched successfully", data=orders, status=200)
