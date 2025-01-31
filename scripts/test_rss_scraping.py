import sys

from loguru import logger

from lib.rss import get_all_rss_sources, parse_rss_feed
from lib.scraper import extract_website
from lib.utils import optimize_text


def check_all_rss():
    all_sources = get_all_rss_sources()

    for d in all_sources:
        source = d['url']

        try:
            d = parse_rss_feed(source)

            if "modified" in d:
                logger.debug(f"Modified: {d['modified']}")

            if d is None:
                raise Exception("Feed is empty")

            if "title" not in d["feed"]:
                raise Exception("Feed title is empty")

            if "entries" not in d:
                raise Exception("Feed entries is none")

            for entry in d["entries"]:
                link = entry["link"]

                website_data = extract_website(link)

                content = optimize_text(website_data["raw_text"])

                if not content:
                    raise Exception("Failed to fetch the website")

                # logger.debug(f"Content: {content}")
                logger.success(f"RSS source ({source}) checked successfully.")

                # We only need to check one article
                break
        except Exception as e:
            logger.error(f"Error ({source}): {e}")
            sys.exit(1)

    logger.success("All RSS sources checked successfully.")


if __name__ == "__main__":
    check_all_rss()
