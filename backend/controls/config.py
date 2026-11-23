from functools import lru_cache
from typing import Optional

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
    )

    # general
    APP_NAME: str = "MyApp"
    ENV: str = "development"
    DEBUG: bool = False
    PORT: int = 8080
    TAX_RATE: float = Field(0.0, ge=0.0)
    TELEMETRY_ENABLED: bool = True
    TELEMETRY_REQUEST_LOG_ENABLED: Optional[bool] = None
    TELEMETRY_REQUEST_LOG_SAMPLE_RATE: Optional[float] = Field(
        None,
        ge=0.0,
        le=1.0,
    )
    DOCS_ENABLED: Optional[bool] = None

    # security
    SECRET_KEY: str = "dev_secret"
    CORS_ALLOWED_ORIGINS: str = ""
    CORS_ALLOW_CREDENTIALS: bool = True
    COOKIE_SAMESITE: Optional[str] = None
    COOKIE_SECURE: Optional[bool] = None

    # redis (cache/session)
    REDIS_URL: Optional[str] = None

    # session/cache prefixes & timeouts
    SESSION_KEY_PREFIX: str = "fastapi_session:"
    CACHE_KEY_PREFIX: str = "fastapi_cache:"
    CACHE_DEFAULT_TIMEOUT: int = 600
    CACHE_INLINE_WRITE_MAX_BYTES: int = Field(32 * 1024, ge=0)
    CACHE_WRITE_QUEUE_MAX_SIZE: int = Field(256, ge=1)
    CACHE_WRITE_QUEUE_WORKERS: int = Field(2, ge=0)

    # database
    DATABASE_URL: str
    DB_POOL_MIN_SIZE: int = 1
    DB_POOL_MAX_SIZE: int = 6
    DB_DISABLE_PREPARED_STATEMENTS: bool = False

    # cloudinary
    CLOUDINARY_URL: Optional[str] = None

    # jwt/auth
    JWT_SECRET: str = "jwt_secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_TTL_SECONDS: int = Field(5 * 60, ge=60)
    JWT_EXP_DAYS: int = 14
    JWT_EXP_DELTA_SECONDS: int = JWT_EXP_DAYS * 24 * 60 * 60
    REFRESH_TOKEN_TTL_SECONDS: int = Field(
        JWT_EXP_DELTA_SECONDS,
        ge=60,
    )

    @model_validator(mode="after")
    def apply_telemetry_defaults(self) -> "Settings":
        if self.DOCS_ENABLED is None:
            self.DOCS_ENABLED = self.is_dev

        if self.TELEMETRY_REQUEST_LOG_ENABLED is None:
            self.TELEMETRY_REQUEST_LOG_ENABLED = self.is_dev or (
                self.TELEMETRY_REQUEST_LOG_SAMPLE_RATE is not None
                and self.TELEMETRY_REQUEST_LOG_SAMPLE_RATE > 0
            )

        if self.TELEMETRY_REQUEST_LOG_SAMPLE_RATE is None:
            if not self.TELEMETRY_REQUEST_LOG_ENABLED:
                self.TELEMETRY_REQUEST_LOG_SAMPLE_RATE = 0.0
            elif self.is_dev:
                self.TELEMETRY_REQUEST_LOG_SAMPLE_RATE = 1.0
            else:
                self.TELEMETRY_REQUEST_LOG_SAMPLE_RATE = 0.01

        return self

    @property
    def is_dev(self) -> bool:
        return self.ENV == "development"

    @property
    def DEBUG_MODE(self) -> bool:
        if self.DEBUG is not None:
            return self.DEBUG
        return self.is_dev

    @property
    def cors_allowed_origins_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.CORS_ALLOWED_ORIGINS.split(",")
            if origin.strip()
        ]

    @property
    def cors_allow_all_origins(self) -> bool:
        return self.is_dev

    @property
    def cookie_samesite(self) -> str:
        if self.COOKIE_SAMESITE:
            return self.COOKIE_SAMESITE
        return "lax" if self.is_dev else "none"

    @property
    def cookie_secure(self) -> bool:
        if self.COOKIE_SECURE is not None:
            return self.COOKIE_SECURE
        return not self.is_dev


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
