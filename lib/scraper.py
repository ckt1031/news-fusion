import json

import trafilatura
from bs4 import BeautifulSoup
from loguru import logger
from seleniumbase import SB

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
            with SB(
                uc=True,
                headless=False,
                locale_code="en",
                undetectable=True,
                uc_subprocess=True,
                ad_block_on=True,
                do_not_track=True,
            ) as sb:
                sb.open(link)
                sb.uc_gui_click_captcha()
                sb.sleep(2)

                tab_title = sb.get_page_title()
                content = sb.get_page_source()

            if "just a moment" in tab_title.lower():
                raise Exception("Captcha detected")

            if "404" in tab_title or "not found" in tab_title.lower():
                raise Exception("Page not found")

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
