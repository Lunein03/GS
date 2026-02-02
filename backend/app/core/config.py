from functools import lru_cache
from typing import Literal

from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=(".env.backend", ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "GS Producao Backend"
    environment: Literal["development", "staging", "production"] = Field(
        default="development",
        validation_alias=AliasChoices("ENVIRONMENT", "APP_ENV"),
    )
    api_v1_prefix: str = "/api/v1"
    database_url: str | None = Field(
        default=None,
        validation_alias=AliasChoices("DATABASE_URL", "DB_URL"),
    )
    alembic_config: str = "alembic.ini"
    api_port: int | None = Field(
        default=None,
        validation_alias=AliasChoices("API_PORT", "PORT"),
    )
    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
        ],
        validation_alias=AliasChoices("CORS_ORIGINS", "CORS_ALLOW_ORIGINS", "FRONTEND_ORIGINS"),
        description="Comma-separated list of allowed CORS origins.",
    )
    allow_lan_cors: bool = Field(
        default=True,
        validation_alias=AliasChoices("ALLOW_LAN_CORS", "ALLOW_LOCAL_NETWORK_CORS"),
        description="Allow any 192.168.x.x origin (useful when testing from another device).",
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
