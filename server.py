from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_limiter import FastAPILimiter

import web.routes
import web.routes.feed
from lib.db.postgres import close_db
from lib.db.redis_client import redis_client
from lib.utils import init_logger

init_logger()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    await FastAPILimiter.init(redis_client)
    FastAPICache.init(RedisBackend(redis_client), prefix="fastapi-cache")

    yield
    await FastAPILimiter.close()
    close_db()


app = FastAPI(
    title="News Fusion",
    lifespan=lifespan,
)


# Health check
@app.get("/health", include_in_schema=False)
async def health():
    return "OK"


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("./web/public/favicon.ico")


app.include_router(web.routes.feed.feed_router, prefix="/v1")
