import asyncio
import traceback

from loguru import logger

from lib.browser import close_browser
from lib.db.postgres import close_db
from lib.db.qdrant import Qdrant
from lib.handler.entry import handle_entry
from lib.rss import get_all_rss_sources, parse_rss_feed
from lib.utils import init_logger

init_logger()


def print_exc(exception):
    traceback.print_exception(type(exception), exception, exception.__traceback__)


async def run_scraper():
    logger.success("Running News Fusion auto scraping service...")

    all_sources = get_all_rss_sources()

    await Qdrant().create_collection()

    for source_config in all_sources:
        category_name = source_config["category"]
        source = source_config["url"]

        logger.info(f"Category: {category_name}, checking source: {source}")

        try:
            feed = parse_rss_feed(source)

            for entry in feed["entries"]:
                try:
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
