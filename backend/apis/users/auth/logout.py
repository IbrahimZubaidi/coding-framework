# logout.py
#
# AUTH — POST /logout
# Pattern: no db conn needed, no get_student dep — works with just the cookie.
# revoke_student_refresh_session() removes the refresh token from Redis.
# clear_auth_cookies() wipes both access and refresh cookies from the response.
# Must attach cookies to the response object directly — not via return value helpers.
# This file requires no schema changes — it is fully generic.

from fastapi import APIRouter, Request

from controls.responses import success_response
from controls.auth import (
    REFRESH_TOKEN_COOKIE_NAME,
    clear_auth_cookies,
    revoke_student_refresh_session,
)

router = APIRouter()


# ─── Handler ──────────────────────────────────────────────────────────────────

@router.post("/logout")
async def logout(request: Request):
    await revoke_student_refresh_session(request.cookies.get(REFRESH_TOKEN_COOKIE_NAME))
    response = success_response(status_code=200)
    clear_auth_cookies(response)
    return response
