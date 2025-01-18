import json
import os
import random
import sys
from functools import cache
from typing import Generator

import feedparser
import trafilatura
import yaml
from bs4 import BeautifulSoup
from loguru import logger

from lib.chrome import chrome_driver
from lib.env import IS_PRODUCTION
from lib.utils import check_if_arg_exists, shuffle_dict_keys


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


def parse_rss_feed(feed_url: str, etag: str = None, last_modified: str = None) -> dict:
    rss_feed = feedparser.parse(feed_url, etag=etag, modified=last_modified)
    return rss_feed


def parse_selector(selector: str, content: str) -> str:
    soup = BeautifulSoup(content, "html.parser")
    s = soup.select_one(selector)

    if s is None:
        raise Exception(f"Failed to find the selector: {selector}")

    return s.prettify()


def get_html_content(link: str, selector: str | None = None) -> str:
    try:
        content = trafilatura.fetch_url(link)

        if content is None:
            raise Exception("Failed to fetch the website")

        return parse_selector(selector, content) if selector else content
    except Exception as e:
        # Try using selenium if it has --selenium-fallback flag
        if check_if_arg_exists("--selenium-fallback"):
            logger.warning(f"Failed to fetch the website: {link}")
            logger.warning("Trying to fetch the website using Selenium")

            chrome_driver.get(link)
            chrome_driver.implicitly_wait(5)

            if (
                "404" in chrome_driver.title
                or "not found" in chrome_driver.title.lower()
            ):
                raise Exception("Page not found")

            content = chrome_driver.page_source

            if content is None:
                raise Exception("Failed to fetch the website using Selenium")

            return parse_selector(selector, content) if selector else content

        logger.error(f"Failed to fetch the website: {link}")
        logger.error(e)
        raise e


def extract_website(link: str, selector: str | None = None) -> dict:
    content = get_html_content(link, selector)

    if content is None or len(content) == 0:
        raise Exception("Nothing fetched from the website")

    json_data = trafilatura.extract(
        content,
        output_format="json",
        with_metadata=True,
        deduplicate=True,
    )

    if json_data is None:
        raise Exception("Failed to extract content from the website")

    return json.loads(json_data)


def get_all_rss_sources(shuffle: bool = False) -> Generator[list[str], None, None]:
    """
    Get all RSS sources from the config file with random order
    :param shuffle: Shuffle the categories and sources
    :return: List of [category, source]
    """

    all_categories_with_sources = get_rss_config()

    # Shuffle the categories to avoid bias
    all_categories_with_sources: dict[str, dict[str, list[str]]] = (
        (shuffle_dict_keys(all_categories_with_sources))
        if shuffle
        else all_categories_with_sources
    )

    for category, data in all_categories_with_sources.items():
        # Shuffle the sources to avoid bias
        random.shuffle(data["sources"])

        for source in data["sources"]:
            yield [category, source]
