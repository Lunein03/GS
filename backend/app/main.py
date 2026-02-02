from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)

    # Configure CORS (make it flexible for LAN/dev usage)
    allow_origin_regex = (
        r"http://192\.168\.\d{1,3}\.\d{1,3}(:\d+)?"
        if settings.allow_lan_cors
        else None
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_origin_regex=allow_origin_regex,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def startup() -> None:
        # Ensure tables exist when running without Alembic (development convenience).
        # Only if database is configured
        if engine is not None:
            Base.metadata.create_all(bind=engine)

    @app.get("/health", tags=["health"])
    def healthcheck() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(api_router, prefix=settings.api_v1_prefix)
    return app


app = create_app()
