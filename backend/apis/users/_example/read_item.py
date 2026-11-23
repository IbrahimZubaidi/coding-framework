# read_item.py
#
# EXAMPLE — GET single resource with cache.
# SQL is commented out — no real table needed.
# Pattern: db.get_db_conn() context manager (read-only, no commit needed).
# Ownership enforced in WHERE — 404 covers both "not found" and "not owned".

import json
from typing import Optional

from fastapi import APIRouter, Depends, Path
from fastapi.encoders import jsonable_encoder
from psycopg.rows import dict_row

import controls.db as db
from controls.auth import get_student
from controls.cache import cache_get_raw, cache_set_raw_backpressured
from controls.cache_utils import build_cache_key
from controls.responses import error_response, success_response

router = APIRouter()

# ─── Cache TTL ────────────────────────────────────────────────────────────────
READ_ITEM_CACHE_TTL_SECONDS = 600


# ─── Handler ──────────────────────────────────────────────────────────────────

@router.get("/{item_id}")
async def read_item(
    item_id : int = Path(..., ge=1),
    student = Depends(get_student),
):
    student_id = student["user_id"]
    cache_key  = build_cache_key("item", student_id, item_id)

    cached = await cache_get_raw(cache_key)
    if cached:
        return success_response(status_code=200, raw_json=cached)

    query = """
        SELECT
            i.id,
            i.name,
            i.description,
            i.status,
            i.created_at
        FROM items i
        WHERE i.id         = %s
          AND i.user_id    = %s
          AND i.is_deleted = FALSE
        LIMIT 1
    """

    # try:
    #     async with db.get_db_conn() as conn:
    #         async with conn.cursor(row_factory=dict_row) as cur:
    #             await cur.execute(query, (item_id, student_id))
    #             row = await cur.fetchone()
    #
    #     if not row:
    #         return error_response("item not found", status_code=404)
    #
    #     payload = json.dumps(
    #         {"data": jsonable_encoder(dict(row))},
    #         separators=(",", ":"),
    #     )
    #
    #     await cache_set_raw_backpressured(cache_key, payload, expire=READ_ITEM_CACHE_TTL_SECONDS)
    #     return success_response(status_code=200, raw_json=payload)
    #
    # except Exception as e:
    #     return error_response(str(e), status_code=500, exc=e)
