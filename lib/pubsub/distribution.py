from loguru import logger

from lib.article import RSSEntity, check_article
from lib.rss import get_category_from_source, parse_rss_feed


async def process_pubsub_distribution(body: bytes):
    xml_str = body.decode("utf-8")

    feed = parse_rss_feed(xml_str)
    entries: list = feed["entries"]

    if len(entries) == 0:
        logger.warning("No entries found in the feed")
        return

    entry = entries[0]

    logger.info(f"Checking article: {entry['link']} ({entry['title']})")

    category = get_category_from_source(entry["link"])

    if category is None:
        logger.error(f"Category not found for source: {entry['link']}")
        return

    await check_article(
        RSSEntity(
            entry=entry,
            category=category,
            feed_title=feed["feed"]["title"],
        )
    )
