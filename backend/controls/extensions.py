from typing import Optional
from psycopg_pool import AsyncConnectionPool
import redis.asyncio as aioredis

db_pool: Optional[AsyncConnectionPool] = None
redis_client: Optional[aioredis.Redis] = None

def set_db_pool(pool: Optional[AsyncConnectionPool]) -> None:
    global db_pool
    db_pool = pool

def get_db_pool() -> AsyncConnectionPool:
    pool = db_pool
    if pool is None:
        raise RuntimeError("DB pool not initialized; are you calling this before app startup?")
    return pool

def set_redis_client(client: Optional[aioredis.Redis]) -> None:
    global redis_client
    redis_client = client

def get_redis_client() -> aioredis.Redis:
    client = redis_client
    if client is None:
        raise RuntimeError("Redis client not initialized; are you calling this before app startup?")
    return client
