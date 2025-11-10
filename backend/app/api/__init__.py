from fastapi import APIRouter

from app.api.routes import catalog, crm, inventory, intranet, proposals

api_router = APIRouter()
api_router.include_router(crm.router)
api_router.include_router(inventory.router)
api_router.include_router(intranet.router)
api_router.include_router(catalog.router)
api_router.include_router(proposals.router)

__all__ = ["api_router"]
