import asyncio
import traceback

from loguru import logger

from lib.db.postgres import close_db
from lib.db.qdrant import Qdrant
from lib.handler.entry import handle_entry
from lib.rss import (
    YOUTUBE_RSS_BASE_URL,
    get_all_rss_sources,
    get_rss_config,
    parse_rss_feed,
)
from lib.types import RSSEntity
from lib.utils import check_if_arg_exists, init_logger, is_site_blacklisted

init_logger()


def print_exc(exception):
    traceback.print_exception(type(exception), exception, exception.__traceback__)


def is_source_allowed(data: dict, source: str):
    only_forum = check_if_arg_exists("--only-forum")
    only_youtube = check_if_arg_exists("--only-youtube")

    # There must be ONE --only-x flag, not both
    if only_forum and only_youtube:
        raise ValueError("Cannot have multiple --only-[x] flags")

    conditions = [
        only_forum and not data.get("forum", False),
        only_youtube and not source.startswith(YOUTUBE_RSS_BASE_URL),
        not check_if_arg_exists("--check-forum") and data.get("forum", False),
        not check_if_arg_exists("--check-youtube")
        and source.startswith(YOUTUBE_RSS_BASE_URL),
    ]

    return not any(conditions)


async def run_scraper():
    logger.success("Running News Fusion auto scraping service...")

    all_sources = get_all_rss_sources(shuffle=True)

    await Qdrant().create_collection()

    for d in all_sources:
        category_name = d["category"]
        source = d["url"]
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
                        RSSEntity(
                            feed_title=feed["feed"]["title"],
                            entry=entry,
                            category=category_name,
                            feed_url=source,
                            source_config=d,
                        )
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
