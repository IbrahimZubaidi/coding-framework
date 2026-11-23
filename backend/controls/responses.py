import logging
from typing import Any, Optional

from fastapi import Response
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from controls.config import settings


logger = logging.getLogger(__name__)


def apply_response_cookies(response: Response, cookies: dict | None) -> Response:
    if not cookies:
        return response

    for name, cookie_value in cookies.items():
        if isinstance(cookie_value, dict):
            value = cookie_value.get("value", "")
            max_age = cookie_value.get("max_age", settings.JWT_EXP_DELTA_SECONDS)
            httponly = cookie_value.get("httponly", True)
            secure = cookie_value.get("secure", settings.cookie_secure)
            samesite = cookie_value.get("samesite", settings.cookie_samesite)
            path = cookie_value.get("path", "/")
        else:
            value = cookie_value
            max_age = settings.JWT_EXP_DELTA_SECONDS
            httponly = True
            secure = settings.cookie_secure
            samesite = settings.cookie_samesite
            path = "/"

        response.set_cookie(
            key=name,
            value=value,
            httponly=httponly,
            secure=secure,
            samesite=samesite,
            max_age=max_age,
            path=path,
        )

    return response


def success_response(
    data: Optional[Any] = None,
    status_code: int = 200,
    cookies: dict | None = None,
    raw_json: str | None = None,
) -> Response:
    if raw_json is not None:
        response = Response(
            status_code=status_code,
            media_type="application/json",
            content=raw_json,
        )
    else:
        payload = {"data": data}
        response = JSONResponse(
            status_code=status_code,
            content=jsonable_encoder(payload),
        )

    return apply_response_cookies(response, cookies)

def error_response(
    message: str,
    status_code: int,
    *,
    exc: Exception | None = None,
    details: Any | None = None,
) -> JSONResponse:
    if exc is not None:
        logger.exception("API error occurred", exc_info=exc)
        if not settings.is_dev:
            message = "Internal server error"
            details = None

    payload = {"error": message}
    if details is not None:
        payload["details"] = jsonable_encoder(details)

    response = JSONResponse(
        status_code=status_code,
        content=payload,
    )

    return response
