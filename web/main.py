import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import uvicorn
from dotenv import load_dotenv
from fastapi import Depends, FastAPI
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
from scalar_fastapi import get_scalar_api_reference

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
    dependencies=[Depends(RateLimiter(times=100, seconds=300))],
)


@app.get(
    "/scalar",
    include_in_schema=False,
    dependencies=[Depends(RateLimiter(times=10, seconds=120))],
)
async def openapi_docs():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title=app.title,
    )


# /v1/feed
app.include_router(v1_router.feed_router, prefix="/v1")

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=4782,
        proxy_headers=os.getenv("PROXY_HEADERS") == "true",
    )
