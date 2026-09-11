from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Kinetix API"
    environment: Literal["development", "test", "staging", "production"] = "development"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"
    database_url: str = Field(
        default="postgresql+asyncpg://kinetix:kinetix@localhost:5432/kinetix"
    )
    cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:5500", "http://127.0.0.1:5500"]
    )
    log_level: str = "INFO"


@lru_cache
def get_settings() -> Settings:
    return Settings()
