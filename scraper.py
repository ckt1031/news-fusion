import random
import sys
import time
from datetime import datetime
from time import sleep

import schedule
from loguru import logger

from pg import Article
from rss import extra_website, get_rss_config, parse_rss_feed
from utils import generate_summary, generate_title, importance_check, optimize_text
from vector_db import News, VectorDB


class RSSEntity:
    def __init__(
            self, title: str, link: str, published_parsed: time.struct_time, category: str
    ):
        self.title = title
        self.link = link
        self.published_parsed = published_parsed
        self.topic = category


def check_article(d: RSSEntity) -> None:
    # Check if the source is already in the database
    result = Article.get_or_none(Article.link == d.link)

    # If it is, skip it
    if result:
        logger.error(f"Article already exists: {d.link}")
        return

    website_data = extra_website(d.link)

    content = optimize_text(website_data["raw_text"])

    vc_db = VectorDB()

    # Check if the article is similar to any other article in the database to remove duplicates
    # If it is, skip it
    similarities = vc_db.find_out_similar_news(
        News(content=content, title=website_data["title"], link=d.link)
    )

    # There exists a similar article from list with a score of 0.75 or higher
    if similarities and similarities[0].score >= 0.70:
        logger.error(f"Similar article found: {similarities[0].payload['link']}")

        Article.create(
            title=d.title,
            topic=d.topic,
            link=d.link,
            image=website_data["image"],
            important=False,
            published_at=datetime.fromtimestamp(time.mktime(d.published_parsed)),
        )

        return

    # Save to VectorDB
    vc_db.insert_news(News(title=website_data["title"], content=content, link=d.link))

    # Check importance
    today_date_str = datetime.now().strftime("%Y-%m-%d")
    news_text_with_meta = f"""
    Title: {d.title}
    Content: {content}
    Date: {today_date_str}
    """
    important = importance_check(news_text_with_meta)

    if not important:
        Article.create(
            title=d.title,
            topic=d.topic,
            link=d.link,
            image=website_data["image"],
            important=False,
            published_at=datetime.fromtimestamp(time.mktime(d.published_parsed)),
        )

        return

    # Run summarization and title generation in parallel
    summary, title = generate_summary(content), generate_title(content)

    # Save to Postgres
    Article.create(
        title=title,
        topic=d.topic,
        link=d.link,
        image=website_data["image"],
        summary=summary,
        important=True,
        published_at=datetime.fromtimestamp(time.mktime(d.published_parsed)),
    )

    logger.success(f"Article saved: {d.link}")


def run_scraper():
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

                check_article(
                    RSSEntity(
                        title=entry.title,
                        link=entry.link,
                        published_parsed=entry.published_parsed,
                        category=topic,
                    )
                )

                # Sleep for a random time between 2 and 5 seconds to avoid getting blocked and slowing down the server
                sleep_time = random.randint(2, 5)
                sleep(sleep_time)


if __name__ == "__main__":
    # Get arguments, if cron is passed, run the scraper once
    if len(sys.argv) > 1 and sys.argv[1] == "cron":
        logger.info("Running in scheduler mode...")

        schedule.every(45).minutes.do(run_scraper)

        while 1:
            schedule.run_pending()
            time.sleep(1)

    run_scraper()
