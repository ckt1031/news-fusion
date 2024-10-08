import os
import random

from llm import LLM, Messages


def optimize_text(text: str) -> str:
    # Remove extra spaces
    text = " ".join(text.split())

    # Remove new lines
    text = text.replace("\n", "")

    return text


def read_txt(file_path: str) -> str:
    # Get script directory
    pwd = os.path.dirname(os.path.realpath(__file__))

    with open(f"{pwd}/{file_path}", "r") as file:
        return file.read()


def generate_summary(text: str) -> str:
    sys_prompt = read_txt("prompts/short-summary.txt")

    # Use the LLM model to generate a summary
    llm = LLM()
    summary = llm.generate_text(
        Messages(system=sys_prompt, user=text), "gemini-1.5-flash-002"
    )

    return summary


def generate_title(text: str) -> str:
    sys_prompt = read_txt("prompts/title-generate.txt")

    # Use the LLM model to generate a title
    llm = LLM()
    title = llm.generate_text(
        Messages(system=sys_prompt, user=text), "gemini-1.5-flash-002"
    )

    return title


def importance_check(text: str) -> bool:
    """
    Pass article content to LLM to check the importance, the LLM will return a string yes or true if the article is important.
    :param text: The article content
    :return: Boolean value indicating if the article is important
    """

    sys_prompt = read_txt("prompts/importance.txt")

    # Use the LLM model to check importance
    llm = LLM()
    importance = llm.generate_text(Messages(system=sys_prompt, user=text)).lower()

    return ("true" in importance) or ("yes" in importance)


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
