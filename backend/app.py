# app.py

from pathlib import Path
import sys

BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

import uvicorn

from application.openapi import tags_metadata
from controls.auth import auto_refresh_auth_middleware
from controls.config import settings
from controls.connection import lifespan
from controls.exceptions import (
    custom_http_exception_handler,
    custom_unexpected_exception_handler,
    custom_validation_exception_handler,
)
from controls.telemetry import http_metrics_middleware

from apis import router as apis


# Create the app and attach the lifespan manager (startup/shutdown)
app = FastAPI(
    title=settings.APP_NAME,
    lifespan=lifespan,
    docs_url="/docs" if settings.DOCS_ENABLED else None,
    redoc_url="/redoc" if settings.DOCS_ENABLED else None,
    openapi_url="/openapi.json" if settings.DOCS_ENABLED else None,
    openapi_tags=tags_metadata,
    swagger_ui_parameters={
        "docExpansion": "none",
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[] if settings.cors_allow_all_origins else settings.cors_allowed_origins_list,
    allow_origin_regex=".*" if settings.cors_allow_all_origins else None,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(auto_refresh_auth_middleware)
if settings.TELEMETRY_ENABLED:
    app.middleware("http")(http_metrics_middleware)
app.include_router(apis)

# Register custom exception handlers for a consistent error payload.
app.add_exception_handler(StarletteHTTPException, custom_http_exception_handler)
app.add_exception_handler(RequestValidationError, custom_validation_exception_handler)
app.add_exception_handler(Exception, custom_unexpected_exception_handler)

if __name__ == "__main__":
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.is_dev
    )
