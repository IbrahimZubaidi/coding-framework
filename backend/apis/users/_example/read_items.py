# read_items.py
#
# EXAMPLE — GET list with pagination, filters, sorting, and cache.
# SQL is commented out — no real table needed.
# Pattern: db.get_db_conn() context manager (read-only, no commit needed).

import json
from enum import Enum
from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from psycopg.rows import dict_row
from pydantic import BaseModel, Field

import controls.db as db
from controls.auth import get_student
from controls.cache import cache_get_raw, cache_set_raw_backpressured
from controls.cache_utils import build_cache_key
from controls.responses import error_response, success_response
from controls.utils import build_paginated_response

router = APIRouter()

# ─── Cache TTL ────────────────────────────────────────────────────────────────
READ_ITEMS_CACHE_TTL_SECONDS = 600


# ─── Enums & Lookup Maps ──────────────────────────────────────────────────────
# · Define locally when only used by this file.
# · Move to apis/common/enums.py only if shared across multiple endpoints.

class SortOrder(str, Enum):
    asc  = "ASC"
    desc = "DESC"

class SortBy(str, Enum):
    created_at = "created_at"
    name       = "name"

SORT_COLUMN_MAP = {
    SortBy.created_at : "i.created_at",
    SortBy.name       : "i.name",
}

class ItemStatus(str, Enum):
    active   = "active"
    archived = "archived"


# ─── Request Model ────────────────────────────────────────────────────────────
# · Query-param models use Depends().

class ItemListParams(BaseModel):
    # pagination
    limit      : Optional[int]     = Field(default=None, ge=1)
    page       : int               = Field(default=1, ge=1)
    # sorting
    sort_by    : SortBy            = SortBy.created_at
    sort_order : SortOrder         = SortOrder.desc
    # filters
    search     : Optional[str]     = Field(default=None, min_length=1, max_length=80)
    status     : Optional[ItemStatus] = None


# ─── Handler ──────────────────────────────────────────────────────────────────

@router.get("")
async def read_items(
    data    : ItemListParams = Depends(),
    student = Depends(get_student),
):
    student_id  = student["user_id"]
    search_term = _normalize_search(data.search)
    search_key  = search_term or "all"
    status_key  = data.status.value if data.status else "all"
    limit_key   = data.limit if data.limit is not None else "all"

    # · Cache key encodes every filter — each unique combination gets its own slot.
    cache_key = build_cache_key(
        "items",
        student_id,
        limit_key,
        data.page,
        data.sort_by.value,
        data.sort_order.value,
        search_key,
        status_key,
    )

    cached = await cache_get_raw(cache_key)
    if cached:
        return success_response(status_code=200, raw_json=cached)

    filter_sql, filter_params = _build_filter_sql(data, search_term)
    params = [student_id, *filter_params]
    limit_clause = ""

    if data.limit is not None:
        offset = (data.page - 1) * data.limit
        limit_clause = "LIMIT %s OFFSET %s"
        params.extend([data.limit, offset])

    # · COUNT(*) OVER() gives total_count on every row — no second COUNT query needed.
    # · meta CTE extracts total_count once so LEFT JOIN works even with 0 rows.
    # · row_num + ORDER BY row_num gives stable, deterministic pagination.
    query = f"""
        WITH base AS (
            SELECT
                i.id,
                i.name,
                i.description,
                i.status,
                i.created_at,
                COUNT(*) OVER () AS total_count,
                ROW_NUMBER() OVER (
                    ORDER BY {SORT_COLUMN_MAP[data.sort_by]} {data.sort_order.value}, i.id DESC
                ) AS row_num
            FROM items i
            WHERE i.user_id    = %s
              AND i.is_deleted = FALSE
              {filter_sql}
        ),
        meta AS (
            SELECT COALESCE(MAX(total_count), 0) AS total_count
            FROM base
        )
        SELECT
            b.id,
            b.name,
            b.description,
            b.status,
            b.created_at,
            m.total_count
        FROM meta m
        LEFT JOIN base b ON TRUE
        ORDER BY b.row_num
        {limit_clause}
    """

    # try:
    #     async with db.get_db_conn() as conn:
    #         async with conn.cursor(row_factory=dict_row) as cur:
    #             await cur.execute(query, tuple(params))
    #             rows = await cur.fetchall()
    #
    #     total = rows[0]["total_count"] if rows else 0
    #     items = []
    #     for row in rows:
    #         if row["id"] is None:          # meta LEFT JOIN produces a null row when empty
    #             continue
    #         item = dict(row)
    #         item.pop("total_count", None)
    #         items.append(item)
    #
    #     response_data = {
    #         "items"      : items,
    #         "pagination" : build_paginated_response(data.page, data.limit, total),
    #     }
    #     payload = json.dumps(
    #         {"data": jsonable_encoder(response_data)},
    #         separators=(",", ":"),         # compact JSON — saves bytes in cache
    #     )
    #
    #     await cache_set_raw_backpressured(cache_key, payload, expire=READ_ITEMS_CACHE_TTL_SECONDS)
    #     return success_response(status_code=200, raw_json=payload)
    #
    # except Exception as e:
    #     return error_response(str(e), status_code=500, exc=e)


# ─── Private Helpers ──────────────────────────────────────────────────────────

def _build_filter_sql(
    data        : ItemListParams,
    search_term : Optional[str],
) -> tuple[str, list]:
    clauses : list[str] = []
    params  : list      = []

    if search_term:
        clauses.append(
            "(LOWER(COALESCE(i.name, '')) LIKE %s"
            " OR LOWER(COALESCE(i.description, '')) LIKE %s)"
        )
        like = f"%{search_term.lower()}%"
        params.extend([like, like])

    if data.status is not None:
        clauses.append("i.status = %s")
        params.append(data.status.value)

    return ("\nAND " + "\nAND ".join(clauses)) if clauses else "", params


def _normalize_search(search: Optional[str]) -> Optional[str]:
    if not search:
        return None
    return search.strip() or None
