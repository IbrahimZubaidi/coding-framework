# create_item.py
#
# EXAMPLE — POST (create) with multi-step transaction.
# SQL is commented out — no real table needed.
# Pattern: Depends(db.get_db_conn_dep) for injected conn — controls commit/rollback.
# RETURNING id gets new PK without a second SELECT.
# Rollback wrapped in its own try/except — rollback itself can fail.
# Cache invalidation happens after commit, never inside the transaction.

from typing import Optional

from fastapi import APIRouter, Depends
from psycopg.rows import dict_row
from pydantic import BaseModel, Field

import controls.db as db
from controls.auth import get_student
from controls.cache import cache_delete_pattern
from controls.cache_utils import build_cache_key
from controls.responses import error_response, success_response

router = APIRouter()


# ─── Request Model ────────────────────────────────────────────────────────────

class CreateItemBody(BaseModel):
    name        : str           = Field(..., min_length=2, max_length=120)
    description : Optional[str] = Field(default=None, max_length=500)


# ─── Handler ──────────────────────────────────────────────────────────────────

@router.post("")
async def create_item(
    data    : CreateItemBody,
    student = Depends(get_student),
    conn    = Depends(db.get_db_conn_dep),
):
    student_id = student["user_id"]

    insert_query = """
        INSERT INTO items (user_id, name, description)
        VALUES (%s, %s, %s)
        RETURNING id
    """

    # try:
    #     async with conn.cursor(row_factory=dict_row) as cur:
    #         await cur.execute(insert_query, (student_id, data.name, data.description))
    #         row     = await cur.fetchone()
    #         item_id = row["id"]
    #
    #         # · Additional inserts/updates in the same transaction go here.
    #         # · Any exception rolls back everything via the except block below.
    #
    #     await conn.commit()
    #     await cache_delete_pattern(build_cache_key("items", student_id, "*"))
    #
    #     return success_response({"item_id": item_id}, status_code=201)
    #
    # except Exception as e:
    #     try:
    #         await conn.rollback()
    #     except Exception:
    #         pass
    #     return error_response(str(e), status_code=500, exc=e)
