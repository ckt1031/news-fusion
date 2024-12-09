import datetime
import os

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse, Response
from fastapi_limiter.depends import RateLimiter
from feedgen.feed import FeedGenerator

from lib.constant import SERVER_URL as CUSTOM_SERVER_URL
from lib.db.postgres import Article
from lib.rss import get_rss_config

feed_router = APIRouter()


async def get_feed(reqiest_base: str, category: str):
    rss_config = get_rss_config()

    # Overwrite the SERVER_URL if it is not None
    server_url = reqiest_base if CUSTOM_SERVER_URL is None else CUSTOM_SERVER_URL

    if category not in rss_config:
        return JSONResponse(
            status_code=404,
            content={
                "error": f"Category ({category}) not found",
            },
        )

    category_name = rss_config[category]["name"]

    IMAGE_PROXY = os.getenv("IMAGE_PROXY_URL", "")

    fg = FeedGenerator()
    fg.title(f"News Fusion - {category_name}")

    # Configure WebSub
    fg.link(href="https://pubsubhubbub.appspot.com/", rel="hub")

    feed_url = f"{server_url}feed/{category}"

    fg.link(href=feed_url, rel="self")

    # fg.description(f"News Fusion - {category}")
    fg.id(feed_url)

    fg.icon(f"{IMAGE_PROXY}{rss_config[category]["icon"]}")

    fg.generator(generator="News Fusion", version="1.0")

    fg.load_extension("media")

    condition = (Article.category == category) & (
        Article.important == True  # noqa: E712
    )

    results = (
        Article.select()
        .where(condition)
        .limit(50)
        .order_by(Article.published_at.desc())
    )

    for result in results:
        fe = fg.add_entry()
        fe.id(result.link)

        fe.title(result.title)

        fe.link(href=result.link)

        fe.description(result.summary)

        # Add timezone, UTC enforced
        published_at: str = result.published_at

        date_time = published_at.replace(tzinfo=datetime.timezone.utc)

        fe.media.content({"url": f"{IMAGE_PROXY}{result.image}", "medium": "image"})

        fe.updated(date_time)

    return fg


@feed_router.get(
    "/feed/{category}",
    summary="Get feed for a category in ATOM format",
    tags=["Feed"],
    dependencies=[Depends(RateLimiter(times=20, seconds=60))],
)
async def category_feed(category: str, request: Request) -> Response:
    request_url = str(request.base_url)
    fg = await get_feed(request_url, category)

    if isinstance(fg, JSONResponse):
        return fg

    return Response(fg.atom_str(), media_type="application/xml")
