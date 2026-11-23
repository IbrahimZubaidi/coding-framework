import logging
import time
from contextlib import asynccontextmanager
from typing import Any, AsyncIterator

from psycopg import AsyncConnection, AsyncCursor

import controls.config as config
import controls.extensions as extensions
import controls.telemetry as telemetry


logger = logging.getLogger("db.pool")
POOL_WAIT_WARN_S = 0.05
_perf_counter = time.perf_counter
_DB_EXECUTE_PATCHED = False
_ORIGINAL_ASYNC_EXECUTE = AsyncCursor.execute
_ORIGINAL_ASYNC_EXECUTEMANY = AsyncCursor.executemany


def _query_operation(query: Any) -> str:
    if isinstance(query, str):
        stripped = query.lstrip()
        if not stripped:
            return "UNKNOWN"
        return stripped.split(None, 1)[0].upper()
    return type(query).__name__.upper()


def install_db_query_instrumentation() -> None:
    global _DB_EXECUTE_PATCHED

    if not config.settings.TELEMETRY_ENABLED:
        return

    if _DB_EXECUTE_PATCHED:
        return

    async def instrumented_execute(self, query, params=None, *args, **kwargs):
        operation = _query_operation(query)
        started = _perf_counter()
        try:
            return await _ORIGINAL_ASYNC_EXECUTE(self, query, params, *args, **kwargs)
        except Exception:
            telemetry.observe_db_error()
            raise
        finally:
            telemetry.observe_db_query(
                duration_ms=(_perf_counter() - started) * 1000.0,
                operation=operation,
            )

    async def instrumented_executemany(self, query, params_seq, *args, **kwargs):
        operation = _query_operation(query)
        started = _perf_counter()
        try:
            return await _ORIGINAL_ASYNC_EXECUTEMANY(self, query, params_seq, *args, **kwargs)
        except Exception:
            telemetry.observe_db_error()
            raise
        finally:
            telemetry.observe_db_query(
                duration_ms=(_perf_counter() - started) * 1000.0,
                operation=operation,
            )

    AsyncCursor.execute = instrumented_execute
    AsyncCursor.executemany = instrumented_executemany
    _DB_EXECUTE_PATCHED = True


@asynccontextmanager
async def get_db_conn() -> AsyncIterator[AsyncConnection]:
    pool = extensions.get_db_pool()  # will raise if not initialized

    started = _perf_counter()
    async with pool.connection() as conn:
        wait_s = _perf_counter() - started
        wait_ms = wait_s * 1000.0
        telemetry.observe_db_pool_wait(wait_ms)

        if wait_s > POOL_WAIT_WARN_S:
            logger.warning("DB_POOL_WAIT_MS=%.1f", wait_ms)

        yield conn


async def get_db_conn_dep():
    async with get_db_conn() as conn:
        yield conn
