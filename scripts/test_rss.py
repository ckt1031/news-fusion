import sys

from loguru import logger

from lib.rss import get_all_rss_sources, parse_rss_feed


def check_all_rss():
    all_sources = get_all_rss_sources()

    for d in all_sources:
        source = d[1]

        try:
            d = parse_rss_feed(source)

            if d is None:
                raise Exception("Feed is empty")

            if "title" not in d["feed"]:
                raise Exception("Feed title is empty")

            if "entries" not in d:
                raise Exception("Feed entries is none")

            logger.success(f"RSS source ({source}) checked successfully.")
        except Exception as e:
            logger.error(f"Error ({source}): {e}")
            sys.exit(1)

    logger.success("All RSS sources checked successfully.")


if __name__ == "__main__":
    check_all_rss()
