from fastapi import Request
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from controls.responses import error_response


async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Normalize HTTP errors to the API's public error contract."""
    return error_response(
        exc.detail if isinstance(exc.detail, str) else str(exc.detail),
        status_code=exc.status_code,
    )


async def custom_validation_exception_handler(request: Request, exc: RequestValidationError):
    """Keep validation failures on the same top-level error shape."""
    return error_response(
        "Validation error",
        status_code=422,
        details=exc.errors(),
    )


async def custom_unexpected_exception_handler(request: Request, exc: Exception):
    """Normalize uncaught exceptions and avoid leaking internals in production."""
    return error_response(
        str(exc),
        status_code=500,
        exc=exc,
    )
