from dotenv import load_dotenv
from fastapi import Depends, FastAPI
from fastapi_limiter.depends import RateLimiter
from scalar_fastapi import get_scalar_api_reference

import web.routes as v1_router

load_dotenv()

app = FastAPI(
    title="News Fusion",
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
