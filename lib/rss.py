import os
import random
import sys
import time
from functools import cache
from typing import Generator

import feedparser
import yaml
from loguru import logger

from lib.env import IS_PRODUCTION
from lib.utils import shuffle_dict_keys

YOUTUBE_RSS_BASE_URL = "https://www.youtube.com/feeds/videos.xml?channel_id="


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

    with open(path, "r", encoding="utf-8") as stream:
        data = yaml.safe_load(stream)

        if data is None or "rss" not in data:
            logger.error("Failed to load config file, please check the format")
            sys.exit(1)

        return data["rss"]


@cache
def get_rss_categories() -> list[str]:
    return list(get_rss_config().keys())


def parse_rss_feed(url: str) -> dict:
    rss_feed = feedparser.parse(url)
    return rss_feed


def get_categories_with_description() -> list[dict[str, str]]:
    rss_config = get_rss_config()

    d = []

    for category, data in rss_config.items():
        if "description" in data:
            d.append({"name": category, "description": data["description"]})

    return d


def get_all_rss_sources(shuffle: bool = False) -> Generator[dict, None, None]:
    """
    Get all RSS sources from the config file with random order
    :param shuffle: Shuffle the categories and sources
    :return: List of [category, source]
    """

    all_categories_with_sources = get_rss_config()

    # Shuffle the categories to avoid bias
    all_categories_with_sources: dict[str, dict[str, list[str | dict[str, str]]]] = (
        (shuffle_dict_keys(all_categories_with_sources))
        if shuffle
        else all_categories_with_sources
    )

    for category, data in all_categories_with_sources.items():
        if "sources" not in data:
            # logger.error(f"No sources found for category: {category}")
            continue

        # Shuffle the sources to avoid bias
        random.shuffle(data["sources"])

        for source in data["sources"]:
            meta = {}
            if isinstance(source, dict):
                url = source["url"]
                meta = source
            else:
                url = source

            if url.startswith("yt:"):
                # Replace yt: with the base URL
                url = source.replace("yt:", YOUTUBE_RSS_BASE_URL)

            d = {
                "url": url,
                "category": category,
                "scrape_needed": meta.get("scrape_needed", True),
                "ignore_titles": meta.get("ignore_titles", []),
            }

            yield d


def parse_published_date(entry: dict) -> time.struct_time:
    published_key = [
        "published_parsed",
        "updated",
        "published",
    ]

    published = None

    for key in published_key:
        if key in entry:
            published = entry[key]
            break

    if not published:
        raise ValueError(f"No published date: {entry['link']}")

    if isinstance(published, str):
        formats = [
            "%Y-%m-%dT%H:%M:%S.%fZ",  # 2018-03-26T13:00:00.000Z
            "%Y-%m-%dT%H:%M:%SZ",  # 2018-03-26T13:00:00Z
        ]

        for fmt in formats:
            try:
                published = time.strptime(published, fmt)
                break
            except ValueError:
                pass

        if isinstance(published, str):
            raise ValueError(f"Failed to parse published date: {published}")

    return published
