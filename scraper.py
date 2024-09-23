import random
from time import sleep

from loguru import logger

from pg import Article
from rss import get_rss_config, parse_rss_feed, extra_website
from vector_db import VectorDB, News


def text_optimization(text: str) -> str:
    # Remove extra spaces
    text = " ".join(text.split())

    # Remove new lines
    text = text.replace("\n", "")

    return text


def check_source(url: str) -> None:
    # Check if the source is already in the database
    result = Article.get_or_none(Article.link == url)

    # If it is, skip it
    if result:
        logger.info(f"Source already exists: {source}")
        return

    vc_db = VectorDB()

    website_data = extra_website(url)

    content = text_optimization(website_data["raw_text"])

    # Check if the article is similar to any other article in the database to remove duplicates
    # If it is, skip it
    similarities = vc_db.find_out_similar_news(News(content=url, title=website_data["title"]))

    # There exists a similar article from list with a score of 0.75 or higher
    if similarities and similarities[0].score >= 0.70:
        logger.error(f"Similar article found: {similarities[0].payload['link']}")
        return

    vc_db.insert_news(News(title=website_data["title"], content=content))

    logger.success(f"Article saved: {url}")


if __name__ == "__main__":
    logger.success("Running News Fusion auto scraping service...")

    all_topics_with_sources = get_rss_config()

    total_number_of_sources = sum(
        [len(sources) for sources in all_topics_with_sources.values()]
    )

    logger.info(f"Total number of sources: {total_number_of_sources}")

    for topic, sources in all_topics_with_sources.items():
        logger.info(f"Topic: {topic} - Number of sources: {len(sources)}")
        for source in sources:
            entries = parse_rss_feed(source)
            for entry in entries:
                logger.info(f"Checking article: {entry.link} ({entry.title})")

                check_source(entry.link)

                # Sleep for a random time between 2 and 5 seconds to avoid getting blocked and slowing down the server
                sleep_time = random.randint(2, 5)
                sleep(sleep_time)
