import os

from lib.llm import LLM, Messages


def read_txt(file_path: str) -> str:
    # Get script directory
    pwd = os.path.dirname(os.path.realpath(__file__))
    path = os.path.join(pwd, file_path)

    with open(path, "r") as file:
        return file.read()


def generate_summary(text: str) -> str:
    sys_prompt = read_txt("../prompts/short-summary.txt")

    # Use the LLM model to generate a summary
    llm = LLM()
    summary = llm.generate_text(
        Messages(system=sys_prompt, user=text), "gemini-1.5-flash-002"
    )

    return summary


def generate_title(text: str) -> str:
    sys_prompt = read_txt("../prompts/title-generate.txt")

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

    sys_prompt = read_txt("../prompts/importance.txt")

    # Use the LLM model to check importance
    llm = LLM()
    importance = llm.generate_text(Messages(system=sys_prompt, user=text)).lower()

    return ("true" in importance) or ("yes" in importance)
