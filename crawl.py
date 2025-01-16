import asyncio

from loguru import logger

from lib.article import RSSEntity, check_article
from lib.db.etag import get_etag, save_etag
from lib.db.qdrant import Qdrant
from lib.rss import get_all_rss_sources, get_rss_config, parse_rss_feed
from lib.utils import block_sites, check_if_arg_exists, init_logger
from lib.youtube import YOUTUBE_RSS_BASE_URL

init_logger()


async def run_scraper():
    logger.success("Running News Fusion auto scraping service...")

    await Qdrant().create_collection()

    all_sources = get_all_rss_sources(shuffle=True)

    for d in all_sources:
        category_name, source = d[0], d[1]
        data = get_rss_config()[category_name]

        # Ensure that the category is not a forum category
        if not check_if_arg_exists("--check-forum") and data.get("forum", False):
            logger.warning(f"Skipping forum category: {category_name}")
            continue

        # --only-forum flag
        if check_if_arg_exists("--only-forum") and not data.get("forum", False):
            logger.warning(f"Skipping non-forum category: {category_name}")
            continue

        # Since server environment might be blocked by Google, we need to skip YouTube sources
        if source.startswith(YOUTUBE_RSS_BASE_URL) and not check_if_arg_exists(
            "--check-youtube"
        ):
            logger.info(f"Skipping YouTube source: {source}")
            continue

        logger.info(f"Category: {category_name}, checking source: {source}")

        try:
            etag = get_etag(source)
            feed = parse_rss_feed(source, etag)

            for entry in feed["entries"]:
                try:
                    if block_sites(entry["link"]):
                        logger.warning(f"Blocked site: {entry['link']}")
                        continue

                    logger.debug(
                        f"Checking article: {entry['link']} ({entry['title']})"
                    )

                    await check_article(
                        RSSEntity(
                            feed_title=feed["feed"]["title"],
                            entry=entry,
                            category=category_name,
                        )
                    )
                except Exception as e:
                    logger.error(f"Error ({entry['link']}): {e}")
                    continue

            if "etag" in feed:
                logger.debug(f"ETag: {feed['etag']}")
                save_etag(source, feed["etag"])
        except Exception as e:
            logger.error(f"Error ({source}): {e}")
            continue


if __name__ == "__main__":
    asyncio.run(run_scraper())
