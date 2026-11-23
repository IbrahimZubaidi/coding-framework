# delete_items.py
#
# EXAMPLE — DELETE bulk resources.
# SQL is commented out — no real table needed.
# Pattern: Depends(db.get_db_conn_dep) for injected conn.
# Dynamic WHERE built at runtime — ownership always enforced as the base condition.
# cur.rowcount tells how many rows were deleted without needing RETURNING.
# Cache tasks built conditionally: specific keys when IDs are known, patterns when delete_all.
# Rollback needed — dynamic query construction means multiple things can go wrong.

import asyncio

from fastapi import APIRouter, Depends
from psycopg.rows import dict_row
from pydantic import BaseModel

import controls.db as db
from controls.auth import get_student
from controls.cache import cache_delete, cache_delete_pattern
from controls.cache_utils import build_cache_key
from controls.responses import error_response, success_response

router = APIRouter()


# ─── Request Model ────────────────────────────────────────────────────────────

class DeleteItemsBody(BaseModel):
    item_ids   : list[int] | None = None
    delete_all : bool             = False


# ─── Handler ──────────────────────────────────────────────────────────────────

@router.delete("")
async def delete_items(
    data    : DeleteItemsBody,
    student = Depends(get_student),
    conn    = Depends(db.get_db_conn_dep),
):
    student_id = student["user_id"]

    if not data.delete_all and not data.item_ids:
        return error_response("Provide item_ids or set delete_all=true", status_code=400)

    target_ids: list[int] | None = None

    # try:
    #     async with conn.cursor(row_factory=dict_row) as cur:
    #         # · Ownership is always the base condition — never skipped.
    #         where  = "WHERE user_id = %s AND is_deleted = FALSE"
    #         params : list = [student_id]
    #
    #         if not data.delete_all:
    #             ids = sorted({int(x) for x in data.item_ids if int(x) > 0})
    #             if not ids:
    #                 return error_response("item_ids has no valid ids", status_code=400)
    #             target_ids = ids
    #             where += " AND id = ANY(%s::int[])"
    #             params.append(ids)
    #
    #         await cur.execute(f"DELETE FROM items {where}", tuple(params))
    #         deleted = cur.rowcount          # how many rows affected, no RETURNING needed
    #
    #     await conn.commit()
    #
    #     if deleted > 0:
    #         cache_tasks = [cache_delete_pattern(build_cache_key("items", student_id, "*"))]
    #         if target_ids is not None:
    #             # · Known IDs — delete specific keys
    #             cache_tasks.extend(
    #                 cache_delete(build_cache_key("item", student_id, iid))
    #                 for iid in target_ids
    #             )
    #         else:
    #             # · delete_all — wipe entire namespace
    #             cache_tasks.append(cache_delete_pattern(build_cache_key("item", student_id, "*")))
    #         await asyncio.gather(*cache_tasks)
    #
    #     return success_response({"deleted_items": deleted}, status_code=200)
    #
    # except Exception as e:
    #     try:
    #         await conn.rollback()
    #     except Exception:
    #         pass
    #     return error_response(str(e), status_code=500, exc=e)
