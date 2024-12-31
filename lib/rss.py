import json
import os
import sys
from functools import cache

import feedparser
import trafilatura
import yaml
from loguru import logger

from lib.env import IS_PRODUCTION


@cache
def get_category_from_source(source: str) -> str | None:
    rss_config = get_rss_config()

    for category, data in rss_config.items():
        if source in data["sources"]:
            return category

    return None


@cache
def get_rss_config() -> dict[str, dict[str, str | list[str]]]:
    path = "./config.yaml" if IS_PRODUCTION else "./dev.config.yaml"

    if not os.path.exists(path):
        logger.error(f"Config file not found at {path}")
        sys.exit(1)

    with open(path, "r") as stream:
        try:
            return yaml.safe_load(stream)["rss"]
        except yaml.YAMLError as exc:
            logger.error(exc)


@cache
def get_rss_categories() -> list[str]:
    return list(get_rss_config().keys())


@cache
def parse_rss_feed(feed: str) -> dict:
    rss_feed = feedparser.parse(feed)
    return rss_feed


@cache
def extract_website(link: str) -> dict:
    content = trafilatura.fetch_url(link)

    if content is None:
        raise Exception("Failed to fetch the website")

    json_data = trafilatura.extract(content, output_format="json", with_metadata=True)

    if json_data is None:
        raise Exception("Failed to extract content from the website")

    return json.loads(json_data)
