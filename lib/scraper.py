import json

import requests
import trafilatura
from html2text import HTML2Text
from loguru import logger

from lib.browser import browser_allowed, browser_driver


def scrape_client_html(url: str) -> str:
    return trafilatura.fetch_url(url)


def scrape_jina_ai(url: str) -> str:
    api_url = f"https://r.jina.ai/{url}"

    headers = {"X-Return-Format": "html"}

    res = requests.get(api_url, headers=headers)
    res.raise_for_status()
    return res.text


def extract_html_to_text(content: str) -> str:
    txt = HTML2Text(bodywidth=0)

    # Ignore images and emphasis
    txt.ignore_emphasis = True
    txt.ignore_images = True

    return txt.handle(content).strip()


def scrape_browser_html(url: str) -> str:
    browser_driver.get(url)
    browser_driver.implicitly_wait(3)

    tab_title = browser_driver.title

    if "just a moment" in tab_title.lower():
        raise Exception("Cloudflare WAF CAPTCHA detected")

    if "404" in tab_title or "not found" in tab_title.lower():
        raise Exception("Page not found")

    return browser_driver.page_source


def extract_html_from_url(link: str) -> str:
    methods = [
        scrape_client_html,
        scrape_jina_ai,
        scrape_browser_html if browser_allowed else None,
    ]

    for method in methods:
        try:
            if method is None:
                continue

            return method(link)
        except Exception as e:
            logger.error(f"Failed to scrape: {link}")
            logger.error(e)
            continue

    raise Exception("Failed to scrape")


def extract_website(link: str) -> dict:
    content = extract_html_from_url(link)

    return parse_html_data(content)


# Parse the HTML data and extract the relevant information via trafilatura
# and convert it to JSON format
def parse_html_data(html: str) -> dict:
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
