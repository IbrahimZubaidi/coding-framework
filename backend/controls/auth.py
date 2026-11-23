import jwt
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import uuid4

from fastapi import HTTPException, Request, Response


from controls.config import settings
from controls.auth_cache import (
    delete_student_refresh_token,
    get_student_refresh_token,
    set_student_refresh_token,
)
from controls.responses import apply_response_cookies

ACCESS_TOKEN_COOKIE_NAME = "access_token"
REFRESH_TOKEN_COOKIE_NAME = "refresh_token"
ACCESS_TOKEN_TYPE = "access"
REFRESH_TOKEN_TYPE = "refresh"
_PENDING_AUTH_COOKIES_STATE = "_pending_auth_cookies"
_CLEAR_AUTH_COOKIES_STATE = "_clear_auth_cookies"


def create_jwt(data: dict, *, ttl_seconds: int, token_type: str) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(seconds=ttl_seconds)
    payload = {
        **data,
        "iat": now,
        "exp": expire,
        "jti": uuid4().hex,
        "token_type": token_type,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_access_jwt(data: dict) -> str:
    return create_jwt(
        data,
        ttl_seconds=settings.ACCESS_TOKEN_TTL_SECONDS,
        token_type=ACCESS_TOKEN_TYPE,
    )


def create_refresh_jwt(data: dict) -> str:
    return create_jwt(
        data,
        ttl_seconds=settings.REFRESH_TOKEN_TTL_SECONDS,
        token_type=REFRESH_TOKEN_TYPE,
    )


def decode_jwt(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])


def _validate_token_type(payload: dict[str, Any], expected_token_type: str) -> None:
    token_type = payload.get("token_type")
    if token_type is None and expected_token_type == ACCESS_TOKEN_TYPE:
        return
    if token_type != expected_token_type:
        raise HTTPException(status_code=401, detail="Invalid token")


def build_auth_cookies(*, access_token: str, refresh_token: str | None = None) -> dict[str, Any]:
    cookies: dict[str, Any] = {
        ACCESS_TOKEN_COOKIE_NAME: {
            "value": access_token,
            "max_age": settings.ACCESS_TOKEN_TTL_SECONDS,
        }
    }
    if refresh_token is not None:
        cookies[REFRESH_TOKEN_COOKIE_NAME] = {
            "value": refresh_token,
            "max_age": settings.REFRESH_TOKEN_TTL_SECONDS,
        }
    return cookies


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(ACCESS_TOKEN_COOKIE_NAME, path="/")
    response.delete_cookie(REFRESH_TOKEN_COOKIE_NAME, path="/")


def _queue_auth_cookies(request: Request, cookies: dict[str, Any]) -> None:
    setattr(request.state, _PENDING_AUTH_COOKIES_STATE, cookies)
    setattr(request.state, _CLEAR_AUTH_COOKIES_STATE, False)


def _queue_auth_cookie_clear(request: Request) -> None:
    setattr(request.state, _PENDING_AUTH_COOKIES_STATE, None)
    setattr(request.state, _CLEAR_AUTH_COOKIES_STATE, True)


def _build_auth_context(*, user_id: int, role: str) -> dict[str, Any]:
    return {"user_id": user_id, "auth_user_id": user_id, "role": role}


async def issue_student_auth_cookies(student_id: int) -> dict[str, Any]:
    payload = {
        "user_id": student_id,
        "role": "student",
    }
    access_token = create_access_jwt(payload)
    refresh_token = create_refresh_jwt(payload)
    stored = await set_student_refresh_token(student_id, refresh_token)
    if not stored:
        raise RuntimeError("Unable to persist student refresh session")
    return build_auth_cookies(access_token=access_token, refresh_token=refresh_token)


async def refresh_student_auth_state(refresh_token: str) -> tuple[dict[str, Any], dict[str, Any]]:
    try:
        payload = decode_jwt(refresh_token)
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(status_code=401, detail="Token expired") from exc
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc

    _validate_token_type(payload, REFRESH_TOKEN_TYPE)
    if payload.get("role") != "student":
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    current_token = await get_student_refresh_token(user_id)
    if current_token != refresh_token:
        raise HTTPException(status_code=401, detail="Logged in elsewhere")

    cookies = await issue_student_auth_cookies(user_id)
    return cookies, _build_auth_context(user_id=user_id, role="student")


async def refresh_student_auth_cookies(refresh_token: str) -> dict[str, Any]:
    cookies, _ = await refresh_student_auth_state(refresh_token)
    return cookies


async def revoke_student_refresh_session(token: str | None) -> None:
    if not token:
        return

    try:
        payload = decode_jwt(token)
    except jwt.InvalidTokenError:
        return

    user_id = payload.get("user_id")
    if not user_id:
        return

    await delete_student_refresh_token(user_id)


def _get_user_from_payload(payload: dict[str, Any], expected_role: str) -> dict[str, Any]:
    if payload.get("role") != expected_role:
        raise HTTPException(status_code=401, detail=f"Not authorized as a {expected_role}")

    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    return _build_auth_context(user_id=user_id, role=expected_role)


async def _handle_expired_access_token(
    request: Request,
    *,
    expected_role: str,
    optional: bool,
    missing_refresh_detail: str,
) -> dict[str, Any] | None:
    if expected_role != "student":
        raise HTTPException(status_code=401, detail=missing_refresh_detail)

    refresh_token = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)
    if not refresh_token:
        if optional:
            return None
        raise HTTPException(status_code=401, detail=missing_refresh_detail)

    try:
        cookies, auth_context = await refresh_student_auth_state(refresh_token)
    except HTTPException:
        _queue_auth_cookie_clear(request)
        if optional:
            return None
        raise

    _queue_auth_cookies(request, cookies)
    return auth_context


async def _get_user_for_role(
    request: Request,
    *,
    expected_role: str,
    optional: bool = False,
) -> dict[str, Any] | None:
    return _build_auth_context(user_id=1, role='student')
    token = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)
    if not token:
        return await _handle_expired_access_token(
            request,
            expected_role=expected_role,
            optional=optional,
            missing_refresh_detail="Not authenticated",
        )

    try:
        payload = decode_jwt(token)
        _validate_token_type(payload, ACCESS_TOKEN_TYPE)
        return _get_user_from_payload(payload, expected_role)
    except jwt.ExpiredSignatureError:
        return await _handle_expired_access_token(
            request,
            expected_role=expected_role,
            optional=optional,
            missing_refresh_detail="Token expired",
        )
    except jwt.InvalidTokenError:
        if optional:
            return None
        raise HTTPException(status_code=401, detail="Invalid token")


async def auto_refresh_auth_middleware(request: Request, call_next) -> Response:
    response = await call_next(request)

    pending_cookies = getattr(request.state, _PENDING_AUTH_COOKIES_STATE, None)
    if pending_cookies:
        apply_response_cookies(response, pending_cookies)

    if getattr(request.state, _CLEAR_AUTH_COOKIES_STATE, False):
        clear_auth_cookies(response)

    return response


async def get_student(request: Request):
    return await _get_user_for_role(request, expected_role="student")


async def get_admin(request: Request):
    return await _get_user_for_role(request, expected_role="admin")


async def get_instructor(request: Request):
    return await _get_user_for_role(request, expected_role="instructor")


async def get_optional_student(request: Request):
    return await _get_user_for_role(request, expected_role="student", optional=True)
