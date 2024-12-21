from loguru import logger

from lib.article import RSSEntity, check_article
from lib.rss import get_category_from_source, parse_rss_feed


def process_pubsub_distribution(body: bytes):
    xml_str = body.decode("utf-8")

    entries: list = parse_rss_feed(xml_str)["entries"]

    if len(entries) == 0:
        return

    entry = entries[0]

    logger.info(f"Checking article: {entry['link']} ({entry['title']})")

    category = get_category_from_source(entry["link"])

    if category is None:
        logger.error(f"Category not found for source: {entry['link']}")
        return

    check_article(
        RSSEntity(
            title=entry["title"],
            link=entry["link"],
            published_parsed=entry["published_parsed"],
            category=category,
        )
    )
