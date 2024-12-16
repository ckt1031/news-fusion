import json
import os
from functools import lru_cache

import feedparser
import trafilatura
import yaml
from loguru import logger

from lib.env import IS_PRODUCTION


@lru_cache
def get_category_from_source(source: str) -> str | None:
    rss_config = get_rss_config()

    for category, data in rss_config.items():
        for src in data["sources"]:
            return category

    return None


@lru_cache
def get_rss_config() -> dict[str, dict[str, list[str | dict]]]:
    CONFIG_PATH = "../config.yaml" if IS_PRODUCTION else "../dev.config.yaml"

    # Get script directory
    pwd = os.path.dirname(os.path.realpath(__file__))
    path = os.path.abspath(os.path.join(pwd, CONFIG_PATH))

    if not os.path.exists(path):
        logger.error(f"Config file not found at {path}")
        exit()

    with open(path, "r") as stream:
        try:
            return yaml.safe_load(stream)["rss"]
        except yaml.YAMLError as exc:
            logger.error(exc)


@lru_cache
def get_rss_categories() -> list[str]:
    return list(get_rss_config().keys())


def parse_rss_feed(feed: str) -> list:
    rss_feed = feedparser.parse(feed)
    return rss_feed.entries


def extract_website(link: str) -> dict:
    content = trafilatura.fetch_url(link)

    if content is None:
        raise Exception("Failed to fetch the website")

    json_data = trafilatura.extract(content, output_format="json", with_metadata=True)

    if json_data is None:
        raise Exception("Failed to extract content from the website")

    return json.loads(json_data)
