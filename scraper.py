import os
import random
import sys
import time
from datetime import datetime
from time import sleep

import requests
import schedule
from dotenv import load_dotenv
from loguru import logger

from pg import Article
from rss import extract_website, get_rss_config, parse_rss_feed
from utils import (
    generate_summary,
    generate_title,
    importance_check,
    optimize_text,
    shuffle_dict_keys,
)
from vector_db import News, VectorDB

load_dotenv()

logger.remove()
logger.add(sys.stdout, format="{time}: [<level>{level}</level>] {message}")

SERVER_URL = os.getenv("SERVER_URL")


class RSSEntity:
    def __init__(
            self, title: str, link: str, published_parsed: time.struct_time, category: str
    ):
        self.title = title
        self.link = link
        self.published_parsed = published_parsed
        self.topic = category


def send_pubsubhubbub_update(category: str):
    url = [
        f"{SERVER_URL}rss/{category}.xml",
        f"{SERVER_URL}rss/{category}.atom",
    ]

    for _url in url:
        requests.post(
            "https://pubsubhubbub.appspot.com/",
            data={
                "hub.mode": "publish",
                "hub.url": _url,
            },
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
            },
        )


def check_article(d: RSSEntity) -> None:
    # Check if the article is older than 3 days
    if (
            datetime.now() - datetime.fromtimestamp(time.mktime(d.published_parsed))
    ).days > 3:
        # logger.error(f"Article is older than 3 days: {d.link}")
        return

    # Check if the source is already in the database
    result = Article.get_or_none(Article.link == d.link)

    # If it is, skip it
    if result:
        # logger.error(f"Article already exists: {d.link}")
        return

    # Sleep for a random time between 2 and 5 seconds to avoid getting blocked and slowing down the server
    sleep_time = random.randint(1, 5)
    sleep(sleep_time)

    website_data = extract_website(d.link)

    content = optimize_text(website_data["raw_text"])

    vc_db = VectorDB()

    # Check if the article is similar to any other article in the database to remove duplicates
    # If it is, skip it
    similarities = vc_db.find_out_similar_news(
        News(content=content, title=website_data["title"], link=d.link)
    )

    # There exists a similar article from list with a score of 0.75 or higher
    if similarities and similarities[0] and similarities[0].score >= 0.70:
        # logger.error(f"Similar article found: {similarities[0].payload['link']}")

        Article.create(
            title=d.title,
            topic=d.topic,
            link=d.link,
            # image=website_data["image"],
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

    send_pubsubhubbub_update(d.topic)


def run_scraper():
    logger.success("Running News Fusion auto scraping service...")

    all_topics_with_sources = get_rss_config()
    all_topics_with_sources = shuffle_dict_keys(all_topics_with_sources)

    for topic, data in all_topics_with_sources.items():
        logger.info(f"Topic: {topic} - Number of sources: {len(data['sources'])}")
        for source in data["sources"]:
            try:
                entries = parse_rss_feed(source)
                for entry in entries:
                    try:
                        # logger.info(f"Checking article: {entry.link} ({entry.title})")

                        check_article(
                            RSSEntity(
                                title=entry.title,
                                link=entry.link,
                                published_parsed=entry.published_parsed,
                                category=topic,
                            )
                        )
                    except Exception as e:
                        logger.error(f"Error: {e}")
                        continue
            except Exception as e:
                logger.error(f"Error: {e}")
                continue


if __name__ == "__main__":
    # Get arguments, if cron is passed, run the scraper once
    if len(sys.argv) > 1 and sys.argv[1] == "cron":
        logger.info("Running in scheduler mode...")

        schedule.every(45).minutes.do(run_scraper)

        while 1:
            schedule.run_pending()
            time.sleep(1)

    run_scraper()
