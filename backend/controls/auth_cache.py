from typing import Optional
from datetime import datetime, timezone

from controls.config import settings
from controls.cache import cache_set_raw, cache_get_raw, cache_delete


def student_refresh_token_key(student_id: int) -> str:
    return f"student_refresh_token:{student_id}"


def student_last_activity_key(student_id: int) -> str:
    return f"student_last_activity:{student_id}"


async def update_last_activity(student_id: int) -> bool:
    now_iso = datetime.now(timezone.utc).isoformat()
    return await cache_set_raw(student_last_activity_key(student_id), now_iso, expire=30 * 24 * 60 * 60)


async def set_student_refresh_token(student_id: int, token: str) -> bool:
    return await cache_set_raw(
        student_refresh_token_key(student_id),
        token,
        expire=settings.REFRESH_TOKEN_TTL_SECONDS,
    )


async def get_student_refresh_token(student_id: int) -> Optional[str]:
    return await cache_get_raw(student_refresh_token_key(student_id))


async def delete_student_refresh_token(student_id: int) -> bool:
    return await cache_delete(student_refresh_token_key(student_id))


async def set_redis_token(student_id: int, token: str) -> bool:
    return await set_student_refresh_token(student_id, token)


async def get_redis_token(student_id: int) -> Optional[str]:
    return await get_student_refresh_token(student_id)


async def delete_redis_token(student_id: int) -> bool:
    return await delete_student_refresh_token(student_id)
