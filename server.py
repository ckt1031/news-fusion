from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi_limiter import FastAPILimiter

import web.routes as v1_router
from lib.db.redis import redis

load_dotenv()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    await FastAPILimiter.init(redis)
    yield
    await FastAPILimiter.close()


app = FastAPI(
    title="News Fusion",
    lifespan=lifespan,
)


# Health check
@app.get("/health")
async def health():
    return {"status": "ok"}


# /v1/feed
app.include_router(v1_router.feed_router, prefix="/v1")
