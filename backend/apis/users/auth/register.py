# register.py
#
# AUTH — POST /register
# Pattern: no get_student dep (public endpoint), two queries in one cursor block (check then insert).
# hash_password() is async — await it before the INSERT.
# issue_student_auth_cookies() logs the user in immediately after registration.
# field_validator on name: strip + alpha-only — adapt validation rules to your domain.
# Both queries share the same cursor — no commit needed between them, commit once at end.
#
# NOTE: SQL queries reference the old `students` table. Update table/column names to match
# your new schema before uncommenting.

import re
from psycopg.rows import dict_row
from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr, Field, field_validator

from controls import db
from controls.auth import issue_student_auth_cookies
from controls.passwords import hash_password
from controls.responses import success_response, error_response

router = APIRouter()


# ─── Request Model ────────────────────────────────────────────────────────────

class RegisterData(BaseModel):
    name     : str      = Field(..., min_length=2, max_length=50)
    email    : EmailStr
    password : str      = Field(..., min_length=8, max_length=128)

    @field_validator("name")
    def name_must_be_alpha(cls, v):
        if not re.fullmatch(r"[A-Za-z ]+", v):
            raise ValueError("Name must contain only letters and spaces")
        return v.strip()


# ─── Handler ──────────────────────────────────────────────────────────────────

@router.post("/register")
async def register(
    data : RegisterData,
    conn = Depends(db.get_db_conn_dep),
):
    name  = data.name
    email = data.email

    check_query = """
        SELECT 1
        FROM users u
        WHERE email = %s
    """

    insert_query = """
        INSERT INTO users (name, email, password_hash)
        VALUES (%s, %s, %s)
        RETURNING id
    """

    # try:
    #     async with conn.cursor(row_factory=dict_row) as cur:
    #         await cur.execute(check_query, (email,))
    #         existing = await cur.fetchone()
    #
    #         if existing:
    #             return error_response("email is already in use", status_code=422)
    #
    #         password_hash = await hash_password(data.password)
    #         await cur.execute(insert_query, (name, email, password_hash))
    #         row = await cur.fetchone()
    #         user_id = row["id"]
    #
    #     await conn.commit()
    #
    #     response_data = {"id": user_id, "name": name, "email": email}
    #     cookies = await issue_student_auth_cookies(user_id)
    #     return success_response(response_data, status_code=200, cookies=cookies)
    #
    # except Exception as e:
    #     return error_response(str(e), status_code=500, exc=e)
