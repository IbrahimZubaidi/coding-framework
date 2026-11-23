import asyncio
import json
import logging
import time
from contextvars import ContextVar
from dataclasses import dataclass
from typing import Any, Optional

from controls import extensions
from controls.config import settings
import controls.telemetry as telemetry


_VERSIONED_NAMESPACE_LENGTHS: dict[str, tuple[int, ...]] = {
    "transactions": (2,),
    "notifications": (2,),
    "exams": (2, 3),
    "sessions": (2, 3),
    "exam": (2,),
    "exam_questions": (2,),
    "exam_question": (2, 3),
}
# Pin logical keys to the version observed during the cache read path so
# background cache writes cannot repopulate a newer namespace with stale data.
_RESOLVED_CACHE_KEYS: ContextVar[dict[str, str] | None] = ContextVar(
    "resolved_cache_keys",
    default=None,
)
_CACHE_WRITE_QUEUE: asyncio.Queue["_CacheWriteRequest"] | None = None
_CACHE_WRITE_WORKERS: list[asyncio.Task[None]] = []

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class _CacheWriteRequest:
    key: str
    value: str
    expire: int | None
    resolved_key: str | None = None


def _split_cache_segments(key: str) -> list[str] | None:
    if not key.startswith(settings.CACHE_KEY_PREFIX):
        return None

    suffix = key[len(settings.CACHE_KEY_PREFIX):]
    return suffix.split(":") if suffix else []


def _get_versioned_namespaces(segments: list[str]) -> tuple[str, ...]:
    if not segments:
        return ()

    namespace_lengths = _VERSIONED_NAMESPACE_LENGTHS.get(segments[0], ())
    return tuple(
        ":".join(segments[:namespace_length])
        for namespace_length in namespace_lengths
        if len(segments) >= namespace_length
    )


def _namespace_version_key(namespace: str) -> str:
    return f"{settings.CACHE_KEY_PREFIX}__namespace_version__:{namespace}"


def _decode_version(raw: Any) -> int:
    if raw is None:
        return 0

    if isinstance(raw, (bytes, bytearray)):
        raw = raw.decode()

    try:
        return int(raw)
    except (TypeError, ValueError):
        return 0


def _apply_versions(key: str, versions: tuple[int, ...]) -> str:
    if not versions:
        return key

    version_suffix = ":".join(str(version) for version in versions)
    return f"{key}:__v__:{version_suffix}"


def _remember_resolved_key(logical_key: str, resolved_key: str) -> None:
    current = _RESOLVED_CACHE_KEYS.get()
    if current is not None and current.get(logical_key) == resolved_key:
        return

    updated = dict(current or {})
    updated[logical_key] = resolved_key
    _RESOLVED_CACHE_KEYS.set(updated)


def _get_remembered_key(logical_key: str) -> Optional[str]:
    current = _RESOLVED_CACHE_KEYS.get()
    if current is None:
        return None
    return current.get(logical_key)


def _should_write_inline(value: str) -> bool:
    inline_limit = max(0, int(settings.CACHE_INLINE_WRITE_MAX_BYTES))
    if inline_limit <= 0:
        return False
    return len(value.encode("utf-8")) <= inline_limit


async def _resolve_cache_key(
    key: str,
    *,
    client=None,
    prefer_context: bool = False,
    remember: bool = False,
) -> str:
    if prefer_context:
        remembered_key = _get_remembered_key(key)
        if remembered_key is not None:
            return remembered_key

    segments = _split_cache_segments(key)
    if not segments:
        if remember:
            _remember_resolved_key(key, key)
        return key

    namespaces = _get_versioned_namespaces(segments)
    if not namespaces:
        if remember:
            _remember_resolved_key(key, key)
        return key

    if client is None:
        client = extensions.get_redis_client()

    raw_versions = await client.mget([_namespace_version_key(namespace) for namespace in namespaces])
    resolved_key = _apply_versions(
        key,
        tuple(_decode_version(raw_version) for raw_version in raw_versions),
    )

    if remember:
        _remember_resolved_key(key, resolved_key)

    return resolved_key


async def _write_raw_value(
    key: str,
    value: str,
    expire: int | None = None,
    *,
    resolved_key: str | None = None,
) -> bool:
    started = time.perf_counter()
    try:
        client = extensions.get_redis_client()
        effective_key = resolved_key
        if effective_key is None:
            effective_key = await _resolve_cache_key(key, client=client, prefer_context=True)
        ttl = expire if expire is not None else settings.CACHE_DEFAULT_TIMEOUT
        if ttl:
            await client.set(effective_key, value, ex=ttl)
        else:
            await client.set(effective_key, value)
        telemetry.observe_cache_write((time.perf_counter() - started) * 1000)
        return True
    except Exception:
        telemetry.observe_cache_error((time.perf_counter() - started) * 1000)
        return False


async def _cache_write_worker() -> None:
    while True:
        queue = _CACHE_WRITE_QUEUE
        if queue is None:
            return

        request = await queue.get()
        try:
            await _write_raw_value(
                request.key,
                request.value,
                expire=request.expire,
                resolved_key=request.resolved_key,
            )
        finally:
            queue.task_done()


async def start_cache_write_queue() -> None:
    global _CACHE_WRITE_QUEUE, _CACHE_WRITE_WORKERS

    if _CACHE_WRITE_WORKERS:
        return

    worker_count = max(0, int(settings.CACHE_WRITE_QUEUE_WORKERS))
    if worker_count == 0:
        return

    queue_size = max(1, int(settings.CACHE_WRITE_QUEUE_MAX_SIZE))
    _CACHE_WRITE_QUEUE = asyncio.Queue(maxsize=queue_size)
    _CACHE_WRITE_WORKERS = [
        asyncio.create_task(_cache_write_worker(), name=f"cache-write-worker-{index}")
        for index in range(worker_count)
    ]
    logger.info(
        "Started cache write queue with workers=%s max_size=%s",
        worker_count,
        queue_size,
    )


async def stop_cache_write_queue() -> None:
    global _CACHE_WRITE_QUEUE, _CACHE_WRITE_WORKERS

    queue = _CACHE_WRITE_QUEUE
    workers = list(_CACHE_WRITE_WORKERS)

    if queue is not None:
        await queue.join()

    for worker in workers:
        worker.cancel()

    if workers:
        await asyncio.gather(*workers, return_exceptions=True)

    _CACHE_WRITE_QUEUE = None
    _CACHE_WRITE_WORKERS = []


async def cache_set_raw_backpressured(key: str, value: str, expire: int | None = None) -> bool:
    queue = _CACHE_WRITE_QUEUE
    if queue is None or _should_write_inline(value):
        return await cache_set_raw(key, value, expire=expire)

    await queue.put(
        _CacheWriteRequest(
            key=key,
            value=value,
            expire=expire,
            resolved_key=_get_remembered_key(key),
        )
    )
    return True


def _extract_invalidation_namespace(pattern: str) -> Optional[str]:
    segments = _split_cache_segments(pattern)
    if not segments:
        return None

    try:
        wildcard_index = segments.index("*")
    except ValueError:
        return None

    if wildcard_index != len(segments) - 1:
        return None

    namespace_lengths = _VERSIONED_NAMESPACE_LENGTHS.get(segments[0], ())
    if wildcard_index not in namespace_lengths:
        return None

    return ":".join(segments[:wildcard_index])


# ---------- RAW (string/bytes) ----------
async def cache_get_raw(key: str) -> Optional[str]:
    started = time.perf_counter()
    try:
        client = extensions.get_redis_client()
        resolved_key = await _resolve_cache_key(key, client=client, remember=True)
        raw = await client.get(resolved_key)
        telemetry.observe_cache_get(
            hit=raw is not None,
            duration_ms=(time.perf_counter() - started) * 1000,
        )
        if raw is None:
            return None
        return raw.decode() if isinstance(raw, (bytes, bytearray)) else str(raw)
    except Exception:
        telemetry.observe_cache_error((time.perf_counter() - started) * 1000)
        return None

async def cache_set_raw(key: str, value: str, expire: int | None = None) -> bool:
    return await _write_raw_value(key, value, expire=expire)

async def cache_delete(key: str) -> bool:
    started = time.perf_counter()
    try:
        client = extensions.get_redis_client()
        resolved_key = await _resolve_cache_key(key, client=client)
        await client.delete(resolved_key)
        telemetry.observe_cache_write((time.perf_counter() - started) * 1000)
        return True
    except Exception:
        telemetry.observe_cache_error((time.perf_counter() - started) * 1000)
        return False

async def cache_invalidate_pattern(pattern: str) -> int:
    started = time.perf_counter()
    try:
        client = extensions.get_redis_client()
        namespace = _extract_invalidation_namespace(pattern)
        if namespace is None:
            if "*" not in pattern:
                return int(await cache_delete(pattern))
            raise ValueError(f"Unsupported cache invalidation pattern: {pattern}")

        await client.incr(_namespace_version_key(namespace))
        telemetry.observe_cache_write((time.perf_counter() - started) * 1000)
        return 1
    except Exception:
        telemetry.observe_cache_error((time.perf_counter() - started) * 1000)
        return 0


async def cache_delete_pattern(pattern: str) -> int:
    return await cache_invalidate_pattern(pattern)


async def cache_flush_all() -> int:
    started = time.perf_counter()
    try:
        client = extensions.get_redis_client()
        keys_before = int(await client.dbsize())
        await client.flushdb()
        telemetry.observe_cache_write((time.perf_counter() - started) * 1000)
        return keys_before
    except Exception:
        telemetry.observe_cache_error((time.perf_counter() - started) * 1000)
        return 0


# ---------- JSON (objects) ----------
async def cache_get(key: str) -> Optional[Any]:
    started = time.perf_counter()
    try:
        client = extensions.get_redis_client()
        resolved_key = await _resolve_cache_key(key, client=client, remember=True)
        raw = await client.get(resolved_key)
        telemetry.observe_cache_get(
            hit=raw is not None,
            duration_ms=(time.perf_counter() - started) * 1000,
        )
        if raw is None:
            return None
        txt = raw.decode() if isinstance(raw, (bytes, bytearray)) else raw
        return json.loads(txt)
    except Exception:
        telemetry.observe_cache_error((time.perf_counter() - started) * 1000)
        return None

async def cache_set(key: str, value: Any, expire: int | None = None) -> bool:
    started = time.perf_counter()
    try:
        client = extensions.get_redis_client()
        resolved_key = await _resolve_cache_key(key, client=client, prefer_context=True)
        payload = json.dumps(value, default=str)
        ttl = expire if expire is not None else settings.CACHE_DEFAULT_TIMEOUT
        if ttl:
            await client.set(resolved_key, payload, ex=ttl)
        else:
            await client.set(resolved_key, payload)
        telemetry.observe_cache_write((time.perf_counter() - started) * 1000)
        return True
    except Exception:
        telemetry.observe_cache_error((time.perf_counter() - started) * 1000)
        return False
