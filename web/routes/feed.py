from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse, Response
from fastapi_cache import Coder
from fastapi_cache.decorator import cache
from fastapi_limiter.depends import RateLimiter
from feedgen.feed import FeedGenerator

from lib.db.postgres import Article
from lib.env import SERVER_URL as CUSTOM_SERVER_URL
from lib.env import get_env
from lib.rss import get_rss_config

feed_router = APIRouter()


async def get_feed(request: Request, category: str, date: str | None = None):
    rss_config = get_rss_config()

    if category not in rss_config:
        return None

    # Overwrite the SERVER_URL if it is not None
    request_base = str(request.base_url)
    server_url = request_base if CUSTOM_SERVER_URL is None else CUSTOM_SERVER_URL

    category_name = rss_config[category]["name"]

    IMAGE_PROXY = get_env("IMAGE_PROXY_URL", "")

    fg = FeedGenerator()
    fg.title(f"News Fusion - {category_name}")

    # Configure WebSub
    fg.link(href="https://pubsubhubbub.appspot.com/", rel="hub")

    feed_url = f"{server_url}feed/{category}"
    fg.link(href=feed_url, rel="self")
    fg.id(feed_url)

    fg.author(name="News Fusion", email="me@tsun1031.xyz")

    if "icon" in rss_config[category]:
        fg.icon(f"{IMAGE_PROXY}{rss_config[category]["icon"]}")

    fg.generator(generator="News Fusion Python")
    fg.load_extension("media")

    condition = (Article.category == category) & (
        Article.important == True  # noqa: E712
    )

    # Date YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS+00:00
    if date and len(date) >= 10:
        # Parse date
        date = datetime.fromisoformat(date)
        start_date = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = date.replace(hour=23, minute=59, second=59, microsecond=999999)
        condition = (
            condition
            & (Article.published_at >= start_date)
            & (Article.published_at <= end_date)
        )

    results = (
        await Article.select()
        .where(condition)
        .order_by(Article.published_at.desc())
        .limit(200)
        .aio_execute()
    )

    for result in results:
        fe = fg.add_entry()
        fe.id(result.link)
        fe.title(result.title)
        fe.link(href=result.link, replace=True)
        fe.author(name=result.publisher)
        fe.description(result.summary)

        if result.image:
            fe.media.content(
                {
                    "url": f"{IMAGE_PROXY}{result.image}",
                    "medium": "image",
                }
            )

        # Add timezone, UTC enforced
        fe.updated(result.published_at.replace(tzinfo=timezone.utc))

    return fg


class XMLResponseCoder(Coder):
    @classmethod
    def encode(cls, value: Response) -> bytes:
        return value.body

    @classmethod
    def decode(cls, value: bytes) -> Response:
        value_str = value.decode("utf-8")
        return Response(
            content=value,
            media_type=(
                "application/xml"
                if value_str.startswith("<?xml")
                else "application/json"
            ),
        )


@feed_router.get(
    "/feed/{category}",
    summary="Get feed for a category in ATOM format",
    tags=["Feed"],
    dependencies=[Depends(RateLimiter(times=20, seconds=60))],
)
@cache(expire=300, coder=XMLResponseCoder)
async def category_feed(
    category: str, request: Request, date: str | None = None
) -> Response:
    fg = await get_feed(request, category, date)

    if not fg:
        return JSONResponse(
            status_code=404,
            content={
                "error": "Category not found",
            },
        )

    return Response(fg.atom_str(), media_type="application/xml")
