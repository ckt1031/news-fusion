from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse, Response
from fastapi_cache.decorator import cache
from fastapi_limiter.depends import RateLimiter
from feedgen.feed import FeedGenerator

from lib.db.postgres import Article
from lib.env import get_env
from lib.rss import get_rss_config
from web.routes.utils import XMLResponseCoder, get_example_atom

feed_router = APIRouter()


async def get_feed(request: Request, category: str, date: str | None = None):
    rss_config = get_rss_config()

    if category not in rss_config:
        return None

    # Overwrite the SERVER_URL if it is not None
    request_base = str(request.base_url)
    custom_server_url = get_env("SERVER_URL")
    server_url = request_base if custom_server_url is None else custom_server_url

    category_name = rss_config[category]["name"]

    fg = FeedGenerator()
    fg.title(f"News Fusion - {category_name}")

    if date:
        fg.description(
            f"Integrated news related to {category_name} specifically on {date}"
        )
    else:
        fg.description(f"Integrated news related to {category_name}")

    feed_url = f"{server_url}feed/{category}"
    fg.link(href=feed_url, rel="self")
    fg.id(feed_url)
    fg.load_extension("media")  # Enable media extension for media content

    condition = (Article.category == category) & (
        Article.important == True  # noqa: E712
    )

    # Date YYYY-MM-DD or ISO format, so it must be at least 10 characters
    if date and len(date) >= 10:
        try:
            # Parse date
            date = datetime.fromisoformat(date)

            condition = (
                condition
                & (Article.published_at.day == date.day)
                & (Article.published_at.month == date.month)
                & (Article.published_at.year == date.year)
            )
        except ValueError:
            # If date is not in ISO format, just skip
            pass

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
                    "url": result.image,
                    "medium": "image",
                }
            )

        # Add timezone, UTC enforced
        fe.updated(result.published_at.replace(tzinfo=timezone.utc))

    return fg


@feed_router.get(
    "/categories",
    summary="Get available feed categories",
    tags=["Feed"],
    dependencies=[Depends(RateLimiter(times=20, seconds=60))],
    response_model=List[str],
    # Example response
    responses={
        200: {
            "content": {
                "application/json": {
                    "example": ["world", "technology", "business"],
                }
            },
        }
    },
)
async def categories() -> Response:
    rss_config = get_rss_config()

    # Get keys from the rss_config
    return JSONResponse(list(rss_config.keys()))


@feed_router.get(
    "/feed/{category}",
    summary="Get feed for a category in ATOM format",
    tags=["Feed"],
    dependencies=[Depends(RateLimiter(times=20, seconds=60))],
    response_class=Response,
    responses={
        200: {
            "content": {
                "application/xml": {
                    "example": get_example_atom(),
                    "schema": {
                        "type": "object",
                        "format": "xml",
                        "xml": {"name": "feed"},
                    },
                },
                "application/json": None,
            },
        },
        404: {
            "content": {
                "application/json": {
                    "example": {"error": "Category not found"},
                }
            },
        },
    },
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
