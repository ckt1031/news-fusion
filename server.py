import datetime
import os

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, PlainTextResponse, Response
from feedgen.feed import FeedGenerator

from pg import Article
from rss import get_rss_config, get_rss_topics

load_dotenv()

SERVER_URL = os.getenv("SERVER_URL", "http://0.0.0.0:4782")

app = FastAPI(
    title="News Fusion",
)


@app.get("/", response_class=PlainTextResponse)
def read_root():
    return "Welcome to News Fusion!"


@app.get("/topics", response_class=JSONResponse, response_model=list[str])
def get_all_topics():
    topics = get_rss_topics()

    return topics


@app.get("/rss/{topic}/sources", response_class=JSONResponse, response_model=list[str])
def get_topic(topic: str):
    rss_config = get_rss_config()

    if topic not in rss_config:
        return JSONResponse(status_code=404, content={"error": "Topic not found"})

    return rss_config[topic]


def get_feed(server_url: str, topic: str, is_atom: bool = False):
    rss_config = get_rss_config()

    if topic not in rss_config:
        return JSONResponse(status_code=404, content={"error": "Topic not found"})

    IMAGE_PROXY = os.getenv("IMAGE_PROXY_URL", "")

    fg = FeedGenerator()
    fg.title(f"News Fusion - {topic}")
    fg.link(href=f"{server_url}rss/{topic}.xml", rel="self")
    fg.description(f"News Fusion - {topic}")
    fg.id(f"{server_url}rss/{topic}.xml")

    if is_atom:
        fg.icon(f"{IMAGE_PROXY}{rss_config[topic]["icon"]}")

    # fg.image(url=f"{IMAGE_PROXY}{rss_config[topic]['icon']}", title=f"News Fusion - {topic}")
    fg.generator(generator="News Fusion", version="1.0")
    fg.author(name="News Fusion", email="dev@tsun1031.xyz")

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

        if not is_atom:
            fe.link(href=result.link)

        fe.description(result.summary)

        # Add timezone, UTC enforced
        date_time = result.published_at.replace(tzinfo=datetime.timezone.utc)

        fe.enclosure(url=f"{IMAGE_PROXY}{result.image}", type="image/jpeg")

        fe.published(date_time)

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


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=4782)
