import os

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Request
from fastapi.responses import PlainTextResponse
from fastapi_limiter.depends import RateLimiter
from scalar_fastapi import get_scalar_api_reference

import routes.v1 as v1_router
from lib.redis_client import lifespan

load_dotenv()

SERVER_URL = os.getenv("SERVER_URL")

app = FastAPI(
    title="News Fusion",
    lifespan=lifespan,
)


@app.get("/", response_class=PlainTextResponse, include_in_schema=False)
def read_root(request: Request):
    server_url = str(request.base_url)
    return f"Welcome to News Fusion! You can access the API at {server_url}scalar"


@app.get(
    "/scalar",
    include_in_schema=False,
    dependencies=[Depends(RateLimiter(times=10, seconds=120))],
)
async def scalar_html():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,  # app.openapi_url is available after app is created
        title=app.title,  # app.title is available after app is created
    )


app.include_router(v1_router.topic_router, prefix="/v1")

app.include_router(v1_router.feed_router, prefix="/v1")
