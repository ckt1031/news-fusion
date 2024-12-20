import asyncio
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi_limiter import FastAPILimiter

import web.routes as v1_router
from lib.db.redis_client import redis
from lib.pubsub.subscription import register_all_topics
from lib.utils import init_logger

init_logger()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    await FastAPILimiter.init(redis)
    # Run await register_all_topics(), but make the app start first and then run the function
    # This is to avoid a deadlock when the app is not started yet
    asyncio.get_event_loop().call_later(1, asyncio.create_task, register_all_topics())

    yield
    await FastAPILimiter.close()
    await register_all_topics(revoke=True)


app = FastAPI(
    title="News Fusion",
    lifespan=lifespan,
)


# Health check
@app.get("/health")
async def health():
    return {"status": "ok"}


app.include_router(v1_router.feed_router, prefix="/v1")
app.include_router(v1_router.pubsub_router, prefix="/v1")
