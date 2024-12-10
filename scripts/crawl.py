import random

from loguru import logger

from lib.article import RSSEntity, check_article
from lib.rss import get_rss_config, parse_rss_feed
from lib.utils import init_logger, shuffle_dict_keys

init_logger()


def run_scraper():
    logger.success("Running News Fusion auto scraping service...")

    all_categories_with_sources = get_rss_config()

    # Shuffle the categories to avoid bias
    all_categories_with_sources: dict[str, dict[str, list[str | dict]]] = (
        shuffle_dict_keys(all_categories_with_sources)
    )

    for category, data in all_categories_with_sources.items():
        logger.info(f"Category: {category} - Number of sources: {len(data['sources'])}")

        # Shuffle the sources to avoid bias
        random.shuffle(data["sources"])

        for source in data["sources"]:
            url = source
            importance_check = True
            similarity_check = True

            if isinstance(source, dict):
                importance_check = source.get("importance_check", True)
                similarity_check = source.get("similarity_check", True)
                url = source["url"]

            try:
                entries = parse_rss_feed(url)

                for entry in entries:
                    try:
                        logger.info(f"Checking article: {entry.link} ({entry.title})")

                        check_article(
                            RSSEntity(
                                title=entry["title"],
                                link=entry["link"],
                                published_parsed=entry["published_parsed"],
                                category=category,
                                importance_check=importance_check,
                                similarity_check=similarity_check,
                            )
                        )
                    except Exception as e:
                        logger.error(f"Error ({entry['link']}): {e}")
                        continue
            except Exception as e:
                logger.error(f"Error ({url}): {e}")
                continue


if __name__ == "__main__":
    run_scraper()
