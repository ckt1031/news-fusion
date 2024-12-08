import random
import sys

from loguru import logger


def init_logger():
    logger.remove()
    logger.add(sys.stdout, format="{time}: [<level>{level}</level>] {message}")


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
