import asyncio
import traceback

from loguru import logger

from lib.db.etag import get_etag, save_etag
from lib.db.postgres import close_db
from lib.db.qdrant import Qdrant
from lib.handler.entry import handle_entry
from lib.rss import get_all_rss_sources, get_rss_config, parse_rss_feed
from lib.types import RSSEntity
from lib.utils import check_if_arg_exists, init_logger, is_site_blacklisted

init_logger()


def print_exc(exception):
    traceback.print_exception(type(exception), exception, exception.__traceback__)


async def run_scraper():
    logger.success("Running News Fusion auto scraping service...")

    all_sources = get_all_rss_sources(shuffle=True)

    await Qdrant().create_collection()

    for d in all_sources:
        category_name, source = d
        data = get_rss_config()[category_name]

        # Ensure that the category is not a forum category
        if not check_if_arg_exists("--check-forum") and data.get("forum", False):
            logger.warning(f"Skipping forum category: {category_name}")
            continue

        # --only-forum flag
        if check_if_arg_exists("--only-forum") and not data.get("forum", False):
            logger.warning(f"Skipping non-forum category: {category_name}")
            continue

        logger.info(f"Category: {category_name}, checking source: {source}")

        try:
            etag = get_etag(source)
            feed = parse_rss_feed(source, etag)

            for entry in feed["entries"]:
                try:
                    if is_site_blacklisted(entry["link"]):
                        logger.warning(f"Blocked site: {entry['link']}")
                        continue

                    logger.debug(
                        f"Checking article: {entry['link']} ({entry['title']})"
                    )

                    await handle_entry(
                        RSSEntity(
                            feed_title=feed["feed"]["title"],
                            entry=entry,
                            category=category_name,
                        )
                    )
                except Exception as e:
                    logger.error(f"Error ({entry['link']})")
                    print_exc(e)
                    continue

            if "etag" in feed:
                logger.debug(f"ETag: {feed['etag']}")
                save_etag(source, feed["etag"])
        except Exception as e:
            logger.error(f"Error ({source})")
            print_exc(e)
            continue


if __name__ == "__main__":
    asyncio.run(run_scraper())
    close_db()
