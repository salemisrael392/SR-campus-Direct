
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Campus Companion API"
    app_env: str = "development"
    api_prefix: str = "/api/v1"
    database_url: str | None = None
    frontend_origins: str = "http://localhost:3000"

    # University registration policy
    university_email_domain: str = "sru.edu.in"
    require_email_verification: bool = False

    # Authentication security
    # Set AUTH_SECRET_KEY in backend/.env before enabling login.
    auth_secret_key: str | None = Field(default=None, repr=False)
    access_token_expire_minutes: int = Field(default=30, gt=0, le=1440)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.frontend_origins.split(",")
            if origin.strip()
        ]

    @property
    def normalized_university_email_domain(self) -> str:
        return self.university_email_domain.strip().lower().lstrip("@")


@lru_cache
def get_settings() -> Settings:
    return Settings()
