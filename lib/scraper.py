import json

import trafilatura
from bs4 import BeautifulSoup
from loguru import logger

from lib.chrome import chrome_driver
from lib.utils import check_if_arg_exists


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
