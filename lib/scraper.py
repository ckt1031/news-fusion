import json

import trafilatura
from bs4 import BeautifulSoup
from loguru import logger

from lib.browser import browser_allowed, browser_driver


def parse_selector(selector: str, content: str) -> str:
    soup = BeautifulSoup(content, "html.parser")
    soup_element = soup.select_one(selector)

    if soup_element is None:
        raise Exception(f"Failed to find the selector: {selector}")

    return soup_element.prettify()


def scrape_client_html(url: str) -> str:
    return trafilatura.fetch_url(url)


def scrape_browser_html(url: str) -> str:
    browser_driver.get(url)
    browser_driver.implicitly_wait(3)

    tab_title = browser_driver.title

    if "just a moment" in tab_title.lower():
        raise Exception("Cloudflare WAF CAPTCHA detected")

    if "404" in tab_title or "not found" in tab_title.lower():
        raise Exception("Page not found")

    return browser_driver.page_source


def get_html_content(link: str, selector: str | None = None) -> str:
    methods = [
        scrape_client_html,
        scrape_browser_html if browser_allowed else None,
    ]

    for method in methods:
        if method is None:
            continue

        try:
            content = method(link)
            return parse_selector(selector, content) if selector else content
        except Exception as e:
            logger.error(f"Failed to scrape: {link}")
            logger.error(e)
            continue

    raise Exception("Failed to scrape")


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
