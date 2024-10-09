import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_limiter import FastAPILimiter
from redis import asyncio as aioredis

redis_connection = aioredis.from_url(os.getenv("REDIS_URL", "redis://localhost"))


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    FastAPICache.init(RedisBackend(redis_connection), prefix="fastapi-cache")
    await FastAPILimiter.init(redis_connection)
    yield
    await FastAPILimiter.close()
