import asyncio
import traceback

from loguru import logger

from lib.browser import close_browser
from lib.db.postgres import close_db
from lib.db.qdrant import Qdrant
from lib.handler.entry import handle_entry
from lib.rss import get_all_rss_sources, get_rss_config, parse_rss_feed
from lib.utils import check_if_arg_exists, init_logger, is_site_blacklisted

init_logger()


def print_exc(exception):
    traceback.print_exception(type(exception), exception, exception.__traceback__)


def is_source_allowed(data: dict, source: str):
    only_forum = check_if_arg_exists("--only-forum")

    conditions = [
        only_forum and not data.get("forum", False),
        not check_if_arg_exists("--check-forum") and data.get("forum", False),
    ]

    return not any(conditions)


async def run_scraper():
    logger.success("Running News Fusion auto scraping service...")

    all_sources = get_all_rss_sources()

    await Qdrant().create_collection()

    for source_config in all_sources:
        category_name = source_config["category"]
        source = source_config["url"]
        data = get_rss_config()[category_name]

        # Check if the source is allowed
        if not is_source_allowed(data, source):
            logger.warning(f"Skipping source: {source}")
            continue

        logger.info(f"Category: {category_name}, checking source: {source}")

        try:
            feed = parse_rss_feed(source)

            for entry in feed["entries"]:
                try:
                    if is_site_blacklisted(entry["link"]):
                        logger.warning(f"Blocked site: {entry['link']}")
                        continue

                    logger.debug(f"Checking {entry['link']} ({entry['title']})")

                    await handle_entry(
                        feed_title=feed["feed"]["title"],
                        entry=entry,
                        category=category_name,
                        feed_url=source,
                        source_config=source_config,
                    )
                except Exception as e:
                    logger.error(f"Error ({entry['link']})")
                    print_exc(e)
                    continue
        except Exception as e:
            logger.error(f"Error ({source})")
            print_exc(e)
            continue


if __name__ == "__main__":
    asyncio.run(run_scraper())
    close_db()
    close_browser()
