import uvicorn

from fastapi import FastAPI
from fastapi.responses import JSONResponse, PlainTextResponse, Response
from feedgen.feed import FeedGenerator

from rss import get_rss_config, get_rss_topics

app = FastAPI()


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


@app.get("/rss/{topic}.xml")
def get_topic_xml(topic: str):
    rss_config = get_rss_config()

    if topic not in rss_config:
        return JSONResponse(status_code=404, content={"error": "Topic not found"})

    fg = FeedGenerator()
    fg.title(f"News Fusion - {topic}")
    fg.link(href=f"http://localhost:4782/rss/{topic}.xml", rel="self")
    fg.description(f"News Fusion - {topic}")

    return Response(content=fg.rss_str(pretty=True), media_type="application/xml")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=4782)
