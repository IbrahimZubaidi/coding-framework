from contextlib import asynccontextmanager
from typing import AsyncGenerator
import logging
import redis.asyncio as aioredis
from psycopg_pool import AsyncConnectionPool

import controls.config as config
import controls.cache as cache
import controls.db as db
import controls.extensions as extensions
 

logger = logging.getLogger("app.connection")
DEFAULT_DB_POOL_MIN_SIZE = 2
DEFAULT_DB_POOL_MAX_SIZE = 10


def _resolve_pool_bounds(settings) -> tuple[int, int]:
    """
    Normalize pool bounds once at startup to prevent invalid values.
    """
    min_size = int(getattr(settings, "DB_POOL_MIN_SIZE", DEFAULT_DB_POOL_MIN_SIZE))
    max_size = int(getattr(settings, "DB_POOL_MAX_SIZE", DEFAULT_DB_POOL_MAX_SIZE))

    if min_size < 1:
        logger.warning("DB_POOL_MIN_SIZE=%s is invalid; using 1", min_size)
        min_size = 1
    if max_size < min_size:
        logger.warning(
            "DB_POOL_MAX_SIZE=%s is smaller than DB_POOL_MIN_SIZE=%s; using %s",
            max_size,
            min_size,
            min_size,
        )
        max_size = min_size

    return min_size, max_size


@asynccontextmanager
async def lifespan(app) -> AsyncGenerator[None, None]:
    """
    Recommended: create and open the DB pool with `async with AsyncConnectionPool(...) as pool:`
    This avoids opening the pool in the constructor and removes the deprecation warning.
    """
    settings = config.settings
    db.install_db_query_instrumentation()
    pool_min_size, pool_max_size = _resolve_pool_bounds(settings)
    redis_url = settings.REDIS_URL
    redis_client = None
    conn_kwargs = {}

    if settings.DB_DISABLE_PREPARED_STATEMENTS:
        conn_kwargs["prepare_threshold"] = None

    # create/open pool using async context manager
    async with AsyncConnectionPool(
        conninfo=settings.DATABASE_URL,
        kwargs=conn_kwargs,
        min_size=pool_min_size,
        max_size=pool_max_size,
        open=False,
    ) as pool:
        # pool is opened and ready here
        extensions.set_db_pool(pool)

        # Redis (optional)
        if redis_url:
            try:
                redis_client = aioredis.from_url(
                    redis_url,
                    decode_responses=True
                )
                # check ping
                await redis_client.ping()
                extensions.set_redis_client(redis_client)
                await cache.start_cache_write_queue()
            except Exception as e:
                logger.warning("Redis ping failed: %s", e)
                if redis_client is not None:
                    await redis_client.close()
                redis_client = None

        # make available on app.state as before
        app.state.db_pool = pool
        app.state.redis = redis_client

        try:
            # app runs while inside this context
            yield
        finally:
            # async context manager will close pool automatically on exit
            # cleanup extensions and redis client
            if redis_client is not None:
                await cache.stop_cache_write_queue()
                await redis_client.close()
            app.state.db_pool = None
            app.state.redis = None
            extensions.set_db_pool(None)
            extensions.set_redis_client(None)
