from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_limiter import FastAPILimiter

import web.routes as v1_router
from lib.db.postgres import close_db
from lib.db.redis_client import redis_client
from lib.env import get_env
from lib.scheduler import scheduler
from lib.utils import init_logger

init_logger()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    await FastAPILimiter.init(redis_client)
    FastAPICache.init(RedisBackend(redis_client), prefix="fastapi-cache")
    # Run await register_all_topics(), but make the app start first and then run the function
    # This is to avoid a deadlock when the app is not started yet
    # asyncio.get_event_loop().call_later(1, asyncio.create_task, register_all_topics())

    yield
    scheduler.shutdown()
    await FastAPILimiter.close()
    # await register_all_topics(revoke=True)
    close_db()


app = FastAPI(
    title="News Fusion",
    lifespan=lifespan,
    servers=[
        {
            "url": get_env("SERVER_URL", "http://localhost:4782"),
        }
    ],
)


def openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="News Fusion",
        version="0.1.0",
        description="This is the API documentation for News Fusion",
        openapi_version="3.0.0",  # Use OpenAPI 3.0 for compatibility with other tools
        servers=[
            {
                "url": get_env("SERVER_URL", "http://localhost:4782"),
            }
        ],
        routes=app.routes,
    )
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = openapi


# Health check
@app.get("/health", include_in_schema=False)
async def health():
    return {"status": "ok"}


app.include_router(v1_router.feed_router, prefix="/v1")
app.include_router(v1_router.pubsub_router, prefix="/v1")
