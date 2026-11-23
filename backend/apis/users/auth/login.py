# login.py
#
# AUTH — POST /login
# Pattern: no get_student dep (public endpoint), db conn for lookup + optional write.
# issue_student_auth_cookies() sets access + refresh tokens as HttpOnly cookies.
# is_sha256 / verify_password_sha256 are legacy migration helpers — remove once all hashes migrated.
# Ownership: no user_id check needed here (we're establishing identity, not guarding a resource).
# No rollback needed for the migration UPDATE — it's a best-effort upgrade, not critical.
#
# NOTE: SQL queries reference the old `students` table. Update table/column names to match
# your new schema before uncommenting.

import re
from psycopg.rows import dict_row
from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr, Field

from controls import db
from controls.auth import issue_student_auth_cookies
from controls.responses import success_response, error_response
from controls.passwords import is_sha256, verify_password_sha256, verify_password, hash_password

router = APIRouter()


# ─── Request Model ────────────────────────────────────────────────────────────

class LoginData(BaseModel):
    email    : EmailStr
    password : str = Field(..., min_length=8, max_length=128)


# ─── Handler ──────────────────────────────────────────────────────────────────

@router.post("/login")
async def login(
    data : LoginData,
    conn = Depends(db.get_db_conn_dep),
):
    email    = data.email
    password = data.password

    query = """
        SELECT
            u.id,
            u.name,
            u.email,
            u.password_hash,
            u.is_banned
        FROM users u
        WHERE email = %s
    """

    # try:
    #     async with conn.cursor(row_factory=dict_row) as cur:
    #         await cur.execute(query, (email,))
    #         user = await cur.fetchone()
    #
    #     if not user:
    #         return error_response("invalid credentials", status_code=401)
    #
    #     user_id     = user["id"]
    #     stored_hash = user["password_hash"]
    #     is_legacy   = is_sha256(stored_hash)
    #
    #     if is_legacy:
    #         valid = await verify_password_sha256(password, stored_hash)
    #     else:
    #         valid = await verify_password(password, stored_hash)
    #
    #     if not valid:
    #         return error_response("invalid credentials", status_code=401)
    #
    #     if user["is_banned"]:
    #         return error_response("your account has been banned", status_code=401)
    #
    #     # Migrate legacy hash — remove once all users are on argon2
    #     if is_legacy:
    #         new_hash = await hash_password(password)
    #         async with conn.cursor() as cur:
    #             await cur.execute(
    #                 "UPDATE users SET password_hash = %s WHERE id = %s",
    #                 (new_hash, user_id),
    #             )
    #         await conn.commit()
    #
    #     response_data = {"id": user_id, "name": user["name"], "email": email}
    #     cookies = await issue_student_auth_cookies(user_id)
    #     return success_response(response_data, status_code=200, cookies=cookies)
    #
    # except Exception as e:
    #     return error_response(str(e), status_code=500, exc=e)
