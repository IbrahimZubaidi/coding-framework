import contextvars
import logging
import random
import time
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional

from fastapi import Request
from starlette.responses import Response

from controls.config import settings


logger = logging.getLogger("app.telemetry")
slow_logger = logging.getLogger("app.telemetry.slow")

SLOW_REQUEST_MS = 500.0
SLOW_DB_QUERY_MS = 100.0


@dataclass(slots=True)
class RequestStats:
    method: str
    route: str
    started_at: float
    cache_hits: int = 0
    cache_misses: int = 0
    cache_writes: int = 0
    cache_errors: int = 0
    cache_time_ms: float = 0.0
    db_queries: int = 0
    db_errors: int = 0
    db_time_ms: float = 0.0
    db_slow_queries: int = 0
    db_pool_wait_ms: float = 0.0


_current_request: contextvars.ContextVar[Optional[RequestStats]] = contextvars.ContextVar(
    "current_request_stats",
    default=None,
)

_route_calls: Counter[tuple[str, str]] = Counter()
_request_status_totals: Counter[tuple[str, str, int]] = Counter()
_route_duration_ms_total: defaultdict[tuple[str, str], float] = defaultdict(float)
_route_db_time_ms_total: defaultdict[tuple[str, str], float] = defaultdict(float)
_route_cache_time_ms_total: defaultdict[tuple[str, str], float] = defaultdict(float)
_route_db_pool_wait_ms_total: defaultdict[tuple[str, str], float] = defaultdict(float)
_route_db_queries_total: Counter[tuple[str, str]] = Counter()
_route_db_errors_total: Counter[tuple[str, str]] = Counter()
_route_cache_hits_total: Counter[tuple[str, str]] = Counter()
_route_cache_misses_total: Counter[tuple[str, str]] = Counter()
_route_cache_writes_total: Counter[tuple[str, str]] = Counter()
_route_cache_errors_total: Counter[tuple[str, str]] = Counter()
_started_at_utc = datetime.now(timezone.utc)
_started_perf = time.perf_counter()


def begin_request(method: str, route: str) -> contextvars.Token:
    if not settings.TELEMETRY_ENABLED:
        return _current_request.set(None)
    stats = RequestStats(method=method, route=route, started_at=time.perf_counter())
    return _current_request.set(stats)


def update_route(route: str) -> None:
    if not settings.TELEMETRY_ENABLED:
        return
    stats = _current_request.get()
    if stats is not None:
        stats.route = route


def observe_cache_get(*, hit: bool, duration_ms: float) -> None:
    if not settings.TELEMETRY_ENABLED:
        return
    stats = _current_request.get()
    if stats is None:
        return

    if hit:
        stats.cache_hits += 1
    else:
        stats.cache_misses += 1

    stats.cache_time_ms += duration_ms
    if logger.isEnabledFor(logging.DEBUG):
        logger.debug(
            "CACHE_GET route=%s hit=%s duration_ms=%.1f",
            stats.route,
            hit,
            duration_ms,
        )


def observe_cache_write(duration_ms: float) -> None:
    if not settings.TELEMETRY_ENABLED:
        return
    stats = _current_request.get()
    if stats is None:
        return

    stats.cache_writes += 1
    stats.cache_time_ms += duration_ms
    if logger.isEnabledFor(logging.DEBUG):
        logger.debug("CACHE_WRITE route=%s duration_ms=%.1f", stats.route, duration_ms)


def observe_cache_error(duration_ms: float) -> None:
    if not settings.TELEMETRY_ENABLED:
        return
    stats = _current_request.get()
    if stats is None:
        return

    stats.cache_errors += 1
    stats.cache_time_ms += duration_ms


def observe_db_query(*, duration_ms: float, operation: str) -> None:
    if not settings.TELEMETRY_ENABLED:
        return
    stats = _current_request.get()
    if stats is None:
        return

    stats.db_queries += 1
    stats.db_time_ms += duration_ms
    if logger.isEnabledFor(logging.DEBUG):
        logger.debug(
            "DB_QUERY route=%s op=%s duration_ms=%.1f",
            stats.route,
            operation,
            duration_ms,
        )

    if duration_ms >= SLOW_DB_QUERY_MS:
        stats.db_slow_queries += 1
        slow_logger.warning(
            "SLOW_DB_QUERY route=%s op=%s duration_ms=%.1f",
            stats.route,
            operation,
            duration_ms,
        )


def observe_db_error() -> None:
    if not settings.TELEMETRY_ENABLED:
        return
    stats = _current_request.get()
    if stats is not None:
        stats.db_errors += 1


def observe_db_pool_wait(wait_ms: float) -> None:
    if not settings.TELEMETRY_ENABLED:
        return
    stats = _current_request.get()
    if stats is not None:
        stats.db_pool_wait_ms += wait_ms


def finish_request(*, token: contextvars.Token, status_code: int, duration_ms: float) -> None:
    if not settings.TELEMETRY_ENABLED:
        _current_request.reset(token)
        return

    stats = _current_request.get()
    _current_request.reset(token)

    if stats is None:
        return

    route_key = (stats.method, stats.route)
    _route_calls[route_key] += 1
    _request_status_totals[(stats.method, stats.route, status_code)] += 1
    _route_duration_ms_total[route_key] += duration_ms
    _route_db_time_ms_total[route_key] += stats.db_time_ms
    _route_cache_time_ms_total[route_key] += stats.cache_time_ms
    _route_db_pool_wait_ms_total[route_key] += stats.db_pool_wait_ms
    _route_db_queries_total[route_key] += stats.db_queries
    _route_db_errors_total[route_key] += stats.db_errors
    _route_cache_hits_total[route_key] += stats.cache_hits
    _route_cache_misses_total[route_key] += stats.cache_misses
    _route_cache_writes_total[route_key] += stats.cache_writes
    _route_cache_errors_total[route_key] += stats.cache_errors
    route_calls = _route_calls[route_key]

    request_log_sample_rate = settings.TELEMETRY_REQUEST_LOG_SAMPLE_RATE or 0.0
    should_log_request = (
        logger.isEnabledFor(logging.INFO)
        and settings.TELEMETRY_REQUEST_LOG_ENABLED
        and request_log_sample_rate > 0.0
        and (
            request_log_sample_rate >= 1.0
            or random.random() < request_log_sample_rate
        )
    )

    if should_log_request:
        logger.info(
            (
                "REQ method=%s route=%s status=%s duration_ms=%.1f route_calls=%s "
                "db_queries=%s db_time_ms=%.1f db_pool_wait_ms=%.1f db_errors=%s "
                "cache_hits=%s cache_misses=%s cache_writes=%s cache_errors=%s cache_time_ms=%.1f"
            ),
            stats.method,
            stats.route,
            status_code,
            duration_ms,
            route_calls,
            stats.db_queries,
            stats.db_time_ms,
            stats.db_pool_wait_ms,
            stats.db_errors,
            stats.cache_hits,
            stats.cache_misses,
            stats.cache_writes,
            stats.cache_errors,
            stats.cache_time_ms,
        )

    if duration_ms >= SLOW_REQUEST_MS:
        slow_logger.warning(
            "SLOW_REQUEST method=%s route=%s status=%s duration_ms=%.1f db_time_ms=%.1f cache_time_ms=%.1f",
            stats.method,
            stats.route,
            status_code,
            duration_ms,
            stats.db_time_ms,
            stats.cache_time_ms,
        )


def get_report(*, limit: int = 100) -> dict:
    if limit < 1:
        limit = 1
    elif limit > 1000:
        limit = 1000

    now = datetime.now(timezone.utc)
    uptime_seconds = round(time.perf_counter() - _started_perf, 3)

    route_items = list(_route_calls.items())
    route_items.sort(key=lambda item: item[1], reverse=True)

    routes = []
    for (method, route), calls in route_items[:limit]:
        key = (method, route)
        hits = _route_cache_hits_total[key]
        misses = _route_cache_misses_total[key]
        cache_reads = hits + misses

        status_counts: dict[str, int] = {}
        for (smethod, sroute, status), count in _request_status_totals.items():
            if smethod == method and sroute == route:
                status_counts[str(status)] = count

        routes.append(
            {
                "method": method,
                "route": route,
                "calls": calls,
                "avg_duration_ms": round(_route_duration_ms_total[key] / calls, 3),
                "avg_db_time_ms": round(_route_db_time_ms_total[key] / calls, 3),
                "avg_cache_time_ms": round(_route_cache_time_ms_total[key] / calls, 3),
                "avg_db_pool_wait_ms": round(_route_db_pool_wait_ms_total[key] / calls, 3),
                "db_queries_total": int(_route_db_queries_total[key]),
                "db_errors_total": int(_route_db_errors_total[key]),
                "cache_hits_total": int(hits),
                "cache_misses_total": int(misses),
                "cache_writes_total": int(_route_cache_writes_total[key]),
                "cache_errors_total": int(_route_cache_errors_total[key]),
                "cache_hit_rate": round((hits / cache_reads), 4) if cache_reads else None,
                "status_counts": status_counts,
            }
        )

    total_requests = int(sum(_route_calls.values()))
    total_cache_hits = int(sum(_route_cache_hits_total.values()))
    total_cache_misses = int(sum(_route_cache_misses_total.values()))
    total_cache_reads = total_cache_hits + total_cache_misses

    status_classes = {
        "2xx": 0,
        "3xx": 0,
        "4xx": 0,
        "5xx": 0,
    }
    for (_, _, status_code), count in _request_status_totals.items():
        if 200 <= status_code < 300:
            status_classes["2xx"] += count
        elif 300 <= status_code < 400:
            status_classes["3xx"] += count
        elif 400 <= status_code < 500:
            status_classes["4xx"] += count
        elif 500 <= status_code < 600:
            status_classes["5xx"] += count

    return {
        "generated_at": now.isoformat(),
        "started_at": _started_at_utc.isoformat(),
        "uptime_seconds": uptime_seconds,
        "totals": {
            "requests": total_requests,
            "avg_request_ms": round((sum(_route_duration_ms_total.values()) / total_requests), 3)
            if total_requests
            else 0.0,
            "db_queries": int(sum(_route_db_queries_total.values())),
            "db_errors": int(sum(_route_db_errors_total.values())),
            "cache_hits": total_cache_hits,
            "cache_misses": total_cache_misses,
            "cache_writes": int(sum(_route_cache_writes_total.values())),
            "cache_errors": int(sum(_route_cache_errors_total.values())),
            "cache_hit_rate": round((total_cache_hits / total_cache_reads), 4)
            if total_cache_reads
            else None,
            "status_classes": status_classes,
        },
        "routes": routes,
    }


def reset_report() -> None:
    global _started_at_utc, _started_perf

    _route_calls.clear()
    _request_status_totals.clear()
    _route_duration_ms_total.clear()
    _route_db_time_ms_total.clear()
    _route_cache_time_ms_total.clear()
    _route_db_pool_wait_ms_total.clear()
    _route_db_queries_total.clear()
    _route_db_errors_total.clear()
    _route_cache_hits_total.clear()
    _route_cache_misses_total.clear()
    _route_cache_writes_total.clear()
    _route_cache_errors_total.clear()
    _started_at_utc = datetime.now(timezone.utc)
    _started_perf = time.perf_counter()


async def http_metrics_middleware(request: Request, call_next) -> Response:
    if not settings.TELEMETRY_ENABLED:
        return await call_next(request)

    token = begin_request(request.method, request.url.path)
    status_code = 500
    started = time.perf_counter()

    try:
        response = await call_next(request)
        status_code = response.status_code
        return response
    finally:
        route = request.scope.get("route")
        route_path = request.url.path
        if route is not None:
            route_path = getattr(route, "path", route_path)
        update_route(route_path)
        finish_request(
            token=token,
            status_code=status_code,
            duration_ms=(time.perf_counter() - started) * 1000,
        )
