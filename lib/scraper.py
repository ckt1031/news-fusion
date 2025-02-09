import json

import trafilatura
from bs4 import BeautifulSoup
from loguru import logger

from lib.browser import browser_allowed, browser_driver


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
        if browser_allowed:
            browser_driver.open(link)
            browser_driver.sleep(2)
            browser_driver.uc_gui_click_captcha()
            browser_driver.sleep(2)

            tab_title = browser_driver.get_page_title()
            content = browser_driver.get_page_source()

            if "just a moment" in tab_title.lower():
                raise Exception("Cloudflare WAF CAPTCHA detected")

            if "404" in tab_title or "not found" in tab_title.lower():
                raise Exception("Page not found")

            if content is None:
                raise Exception("Failed to fetch via Selenium")

            return parse_selector(selector, content) if selector else content

        logger.error(f"Failed to fetch: {link}")
        logger.error(e)
        raise e


def extract_website(link: str, selector: str | None = None) -> dict:
    content = get_html_content(link, selector)

    return get_json_scraped_data(content)


def get_json_scraped_data(html: str) -> dict:
    if html is None or len(html) == 0:
        raise Exception("Nothing fetched from website")

    json_data = trafilatura.extract(
        html,
        output_format="json",
        with_metadata=True,
        deduplicate=True,
    )

    if json_data is None:
        raise Exception("Failed to extract content from website")

    return json.loads(json_data)
