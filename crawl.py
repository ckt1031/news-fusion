import random
import sys
import time

from loguru import logger

from lib.article import RSSEntity, check_article
from lib.rss import get_rss_config, parse_rss_feed
from lib.utils import init_logger, shuffle_dict_keys

init_logger()


def check_if_arg_exists(arg: str) -> bool:
    sys_arg = sys.argv

    return arg in sys_arg


def run_scraper():
    logger.success("Running News Fusion auto scraping service...")

    all_categories_with_sources = get_rss_config()

    # Shuffle the categories to avoid bias
    all_categories_with_sources: dict[str, dict[str, list[str | dict]]] = (
        shuffle_dict_keys(all_categories_with_sources)
    )

    for category, data in all_categories_with_sources.items():
        category_name = data.get("name", category)

        # Ensure that the category is not a forum category
        if not check_if_arg_exists("--check-forum") and data.get("forum", False):
            logger.info(f"Skipping forum category: {category_name}")
            continue

        # --only-forum flag
        if check_if_arg_exists("--only-forum") and not data.get("forum", False):
            logger.info(f"Skipping non-forum category: {category_name}")
            continue

        logger.info(f"Category: {category_name}, total sources: {len(data['sources'])}")

        # Shuffle the sources to avoid bias
        random.shuffle(data["sources"])

        for source in data["sources"]:
            try:
                feed = parse_rss_feed(source)

                for entry in feed["entries"]:
                    try:
                        logger.debug(
                            f"Checking article: {entry['link']} ({entry['title']})"
                        )

                        published = entry.get("published_parsed")

                        if not published:
                            published = entry.get("updated")

                        if not published:
                            published = entry.get("published")

                        if not published:
                            logger.error(f"Error ({entry['link']}): No published date")
                            continue

                        if isinstance(published, str):
                            # 2018-03-26T13:00:00.000Z
                            published = time.strptime(
                                published, "%Y-%m-%dT%H:%M:%S.%fZ"
                            )

                        check_article(
                            RSSEntity(
                                title=entry["title"],
                                link=entry["link"],
                                published_parsed=published,
                                category=category,
                                feed_title=feed["feed"]["title"],
                            )
                        )
                    except Exception as e:
                        logger.error(f"Error ({entry['link']}): {e}")
                        continue
            except Exception as e:
                logger.error(f"Error ({source}): {e}")
                continue


if __name__ == "__main__":
    run_scraper()
