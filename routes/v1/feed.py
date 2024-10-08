import datetime
import os

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, Response
from fastapi_cache import Coder
from fastapi_cache.decorator import cache
from feedgen.feed import FeedGenerator

from lib.db import Article
from lib.rss import get_rss_config

feed_router = APIRouter()

SERVER_URL = os.getenv("SERVER_URL")


def get_feed(server_url: str, topic: str, is_atom: bool = False):
    rss_config = get_rss_config()

    # Overwrite the SERVER_URL if it is not None
    server_url = server_url if SERVER_URL is None else SERVER_URL

    if topic not in rss_config:
        return JSONResponse(status_code=404, content={"error": "Topic not found"})

    IMAGE_PROXY = os.getenv("IMAGE_PROXY_URL", "")

    fg = FeedGenerator()
    fg.title(f"News Fusion - {topic}")

    fg.link(href="https://pubsubhubbub.appspot.com/", rel="hub")

    feed_format = "atom" if is_atom else "xml"
    feed_url = f"{server_url}rss/{topic}.{feed_format}"

    fg.link(href=feed_url, rel="self")

    fg.description(f"News Fusion - {topic}")
    fg.id(feed_url)

    if is_atom:
        fg.icon(f"{IMAGE_PROXY}{rss_config[topic]["icon"]}")

    # fg.image(url=f"{IMAGE_PROXY}{rss_config[topic]['icon']}", title=f"News Fusion - {topic}")
    fg.generator(generator="News Fusion", version="1.0")
    fg.author(name="News Fusion", email="dev@tsun1031.xyz")

    fg.load_extension("media")

    results = (
        Article.select()
        .where((Article.topic == topic) & (Article.important == True))  # noqa: E712
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
        date_time = result.published_at.replace(tzinfo=datetime.timezone.utc)

        fe.media.content({"url": f"{IMAGE_PROXY}{result.image}", "medium": "image"})
        # fe.enclosure(url=f"{IMAGE_PROXY}{result.image}", type="image/jpeg")

        fe.updated(date_time) if is_atom else fe.published(date_time)

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


@feed_router.get("/rss/{topic}.xml", summary="Get RSS feed for a topic", tags=["Feed"])
@cache(expire=60, coder=XMLResponseCoder)
def get_topic_xml(topic: str, request: Request) -> Response:
    server_url = str(request.base_url)
    fg = get_feed(server_url, topic)

    # If fg return a JSONResponse, return it
    if isinstance(fg, JSONResponse):
        return fg

    return Response(content=fg.rss_str(pretty=True), media_type="application/xml")


@feed_router.get(
    "/rss/{topic}.atom", summary="Get Atom feed for a topic", tags=["Feed"]
)
@cache(expire=60, coder=XMLResponseCoder)
def get_topic_atom(topic: str, request: Request) -> Response:
    server_url = str(request.base_url)
    fg = get_feed(server_url, topic, is_atom=True)

    # If fg return a JSONResponse, return it
    if isinstance(fg, JSONResponse):
        return fg

    return Response(content=fg.atom_str(pretty=True), media_type="application/xml")
