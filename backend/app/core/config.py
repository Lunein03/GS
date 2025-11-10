from functools import lru_cache
from typing import Literal

from pydantic import AliasChoices, Field
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
    database_url: str
    alembic_config: str = "alembic.ini"
    api_port: int | None = Field(
        default=None,
        validation_alias=AliasChoices("API_PORT", "PORT"),
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
