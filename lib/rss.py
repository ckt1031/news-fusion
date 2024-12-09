import json
import os

import feedparser
import trafilatura
import yaml
from loguru import logger


def get_category_from_source(source: str) -> str | None:
    rss_config = get_rss_config()

    for category, data in rss_config.items():
        if source in data["sources"]:
            return category

    return None


def get_rss_config() -> dict[str, dict[str, list[str]]]:
    CONFIG_PATH = "../config.yaml"

    # Get script directory
    pwd = os.path.dirname(os.path.realpath(__file__))
    path = os.path.join(pwd, CONFIG_PATH)

    with open(path, "r") as stream:
        try:
            return yaml.safe_load(stream)["rss"]
        except yaml.YAMLError as exc:
            logger.error(exc)


def get_rss_categories() -> list[str]:
    return list(get_rss_config().keys())


def parse_rss_feed(feed: str) -> list:
    rss_feed = feedparser.parse(feed)
    return rss_feed.entries


def extract_website(link: str) -> dict:
    content = trafilatura.fetch_url(link)
    json_data = trafilatura.extract(content, output_format="json", with_metadata=True)
    return json.loads(json_data)
