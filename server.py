import datetime
import os

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, PlainTextResponse, Response
from feedgen.feed import FeedGenerator
from scalar_fastapi import get_scalar_api_reference

from pg import Article
from rss import get_rss_config, get_rss_topics

load_dotenv()

SERVER_URL = os.getenv("SERVER_URL")

app = FastAPI(
    title="News Fusion",
)


@app.get("/", response_class=PlainTextResponse)
def read_root(request: Request):
    server_url = str(request.base_url)
    return f"Welcome to News Fusion! You can access the API at {server_url}scalar"


@app.get("/scalar", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,  # app.openapi_url is available after app is created
        title=app.title,  # app.title is available after app is created
    )


@app.get("/topics", response_class=JSONResponse, response_model=list[str])
def get_all_topics():
    topics = get_rss_topics()

    return topics


@app.get("/rss/{topic}/sources", response_class=JSONResponse, response_model=list[str])
def get_topic(topic: str):
    rss_config = get_rss_config()

    if topic not in rss_config:
        return JSONResponse(status_code=404, content={"error": "Topic not found"})

    return rss_config[topic]["sources"]


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


@app.get("/rss/{topic}.xml")
def get_topic_xml(topic: str, request: Request):
    server_url = str(request.base_url)
    fg = get_feed(server_url, topic)

    # If fg return a JSONResponse, return it
    if isinstance(fg, JSONResponse):
        return fg

    return Response(content=fg.rss_str(pretty=True), media_type="application/xml")


@app.get("/rss/{topic}.atom")
def get_topic_atom(topic: str, request: Request):
    server_url = str(request.base_url)
    fg = get_feed(server_url, topic, is_atom=True)

    # If fg return a JSONResponse, return it
    if isinstance(fg, JSONResponse):
        return fg

    return Response(content=fg.atom_str(pretty=True), media_type="application/xml")
