import hashlib
import json
import random
import sys
from functools import cache
from urllib.parse import urlparse

from loguru import logger

from lib.config import BLOCKED_HOST


def init_logger():
    logger.remove()
    logger.add(sys.stdout, format="{time}: [<level>{level}</level>] {message}")


def sha1_hash(text: str) -> str:
    return hashlib.sha1(text.encode()).hexdigest()


def shuffle_dict_keys(data: dict[str, any]) -> dict[str, any]:
    """
    Creates a new dictionary with the same key-value pairs but in a
    randomized key order.\

    :param data: The input dictionary.
    :type data: dict[str, any]

    :return: A new dictionary with shuffled keys.
    """
    keys = list(data.keys())
    random.shuffle(keys)
    return {key: data[key] for key in keys}


def optimize_text(text: str) -> str:
    """
    Optimize the text by removing extra spaces and new lines
    :param text: The text to optimize
    :return: Optimized text
    """

    # Remove extra spaces
    text = " ".join(text.split())

    # Remove new lines
    text = text.replace("\n", "")

    return text


def check_if_arg_exists(arg: str) -> bool:
    sys_arg = sys.argv

    return arg in sys_arg


def is_site_blacklisted(url: str):
    # Check host
    return urlparse(url).netloc in BLOCKED_HOST


@cache
def get_sources() -> list[str]:
    with open("./source-names.json", "r", encoding="utf-8") as file:
        return json.load(file)


def get_source_name_from_cache(url: str) -> str | None:
    """
    Extract the source name from the URL
    :param url: The URL
    :return: The source name
    """

    try:
        source_names = get_sources()
        if url not in source_names:
            return None

        return source_names[url]
    except FileNotFoundError:
        return None
