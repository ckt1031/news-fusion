import random

from loguru import logger

from lib.article import RSSEntity, check_article
from lib.rss import get_rss_config, parse_rss_feed
from lib.utils import block_sites, check_if_arg_exists, init_logger, shuffle_dict_keys
from lib.youtube import YOUTUBE_RSS_BASE_URL

init_logger()


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
            logger.warning(f"Skipping forum category: {category_name}")
            continue

        # --only-forum flag
        if check_if_arg_exists("--only-forum") and not data.get("forum", False):
            logger.warning(f"Skipping non-forum category: {category_name}")
            continue

        logger.info(f"Category: {category_name}, total sources: {len(data['sources'])}")

        # Shuffle the sources to avoid bias
        random.shuffle(data["sources"])

        for source in data["sources"]:
            if source.startswith("yt:"):
                if not check_if_arg_exists("--check-youtube"):
                    logger.info(f"Skipping YouTube source: {source}")
                    continue

                source = source.replace("yt:", YOUTUBE_RSS_BASE_URL)

            try:
                feed = parse_rss_feed(source)

                for entry in feed["entries"]:
                    try:
                        if block_sites(entry["link"]):
                            logger.warning(f"Blocked site: {entry['link']}")
                            continue

                        logger.debug(
                            f"Checking article: {entry['link']} ({entry['title']})"
                        )

                        check_article(
                            RSSEntity(
                                feed_title=feed["feed"]["title"],
                                entry=entry,
                                category=category,
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
