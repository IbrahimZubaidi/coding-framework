# update_item.py
#
# EXAMPLE — PATCH (update) single resource.
# SQL is commented out — no real table needed.
# Pattern: Depends(db.get_db_conn_dep) for injected conn.
# Ownership enforced in WHERE — RETURNING detects "not found or not owned" in one shot.
# No rollback — single query, nothing to undo on failure.
# asyncio.gather fires multiple cache invalidations in parallel.

import asyncio
from typing import Optional

from fastapi import APIRouter, Depends, Path
from psycopg.rows import dict_row
from pydantic import BaseModel, Field

import controls.db as db
from controls.auth import get_student
from controls.cache import cache_delete, cache_delete_pattern
from controls.cache_utils import build_cache_key
from controls.responses import error_response, success_response

router = APIRouter()


# ─── Request Model ────────────────────────────────────────────────────────────

class UpdateItemBody(BaseModel):
    name        : str           = Field(..., min_length=2, max_length=120)
    description : Optional[str] = Field(default=None, max_length=500)


# ─── Handler ──────────────────────────────────────────────────────────────────

@router.patch("/{item_id}")
async def update_item(
    data    : UpdateItemBody,
    item_id : int = Path(..., ge=1),
    student = Depends(get_student),
    conn    = Depends(db.get_db_conn_dep),
):
    student_id = student["user_id"]

    query = """
        UPDATE items
        SET
            name        = %s,
            description = %s,
            updated_at  = NOW()
        WHERE id         = %s
          AND user_id    = %s
          AND is_deleted = FALSE
        RETURNING id
    """

    # try:
    #     async with conn.cursor(row_factory=dict_row) as cur:
    #         await cur.execute(query, (data.name, data.description, item_id, student_id))
    #         row = await cur.fetchone()
    #
    #     if not row:
    #         return error_response("item not found", status_code=404)
    #
    #     await conn.commit()
    #     await asyncio.gather(
    #         cache_delete(build_cache_key("item",  student_id, item_id)),
    #         cache_delete_pattern(build_cache_key("items", student_id, "*")),
    #     )
    #
    #     return success_response({"item_id": item_id}, status_code=200)
    #
    # except Exception as e:
    #     return error_response(str(e), status_code=500, exc=e)
