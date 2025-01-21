from loguru import logger

from lib.handler.entry import handle_entry
from lib.rss import get_category_from_source, parse_rss_feed
from lib.types import RSSEntity


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

    await handle_entry(
        RSSEntity(
            entry=entry,
            category=category,
            feed_title=feed["feed"]["title"],
        )
    )
