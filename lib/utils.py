import hashlib
import random
import sys
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
