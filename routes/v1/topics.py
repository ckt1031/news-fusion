from fastapi import APIRouter
from fastapi.responses import JSONResponse
from fastapi_cache.decorator import cache

from lib.rss import get_rss_topics

topic_router = APIRouter()


@topic_router.get(
    "/topics", response_class=JSONResponse, response_model=list[str], tags=["Feed"]
)
@cache(expire=86400)
def get_all_topics():
    topics = get_rss_topics()

    return topics
