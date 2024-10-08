import os
import json

import feedparser
import trafilatura
import yaml
from loguru import logger

CONFIG_PATH = "config.yml"


def get_rss_config() -> dict[str, dict[str, list[str]]]:
    # Get script directory
    pwd = os.path.dirname(os.path.realpath(__file__))

    with open(f"{pwd}/{CONFIG_PATH}", "r") as stream:
        try:
            return yaml.safe_load(stream)["rss"]
        except yaml.YAMLError as exc:
            logger.error(exc)


def get_rss_topics() -> list[str]:
    return list(get_rss_config().keys())


def parse_rss_feed(feed):
    rss_feed = feedparser.parse(feed)
    return rss_feed.entries


def extract_website(link):
    downloaded = trafilatura.fetch_url(link)
    json_data = trafilatura.extract(
        downloaded, output_format="json", with_metadata=True
    )
    return json.loads(json_data)
