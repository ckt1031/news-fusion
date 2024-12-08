import random
import time
from datetime import datetime
from time import sleep

from loguru import logger

from lib.db.postgres import Article
from lib.db.qdrant import News, VectorDB
from lib.llm import LLM
from lib.prompts import news_importance, short_summary, title_generate
from lib.rss import extract_website
from lib.utils import optimize_text
from lib.web_sub import send_pubsubhubbub_update


class RSSEntity:
    def __init__(
        self, title: str, link: str, published_parsed: time.struct_time, category: str
    ):
        self.title = title
        self.link = link
        self.published_parsed = published_parsed
        self.category = category


def generate_summary(content: str) -> str:
    return LLM().generate_text(short_summary, content)


def generate_title(content: str) -> str:
    return LLM().generate_text(title_generate, content)


def importance_check(content: str) -> bool:
    response = LLM().generate_text(news_importance, content).lower()

    return ("true" in response) or ("important" in response)


def check_article(d: RSSEntity) -> None:
    # Check if the article is older than 3 days
    timestamp = time.mktime(d.published_parsed)
    if (datetime.now() - datetime.fromtimestamp(timestamp)).days > 3:
        logger.debug(f"Article is older than 3 days: {d.link}")
        return

    # Check if the source is already in the database
    result = Article.get_or_none(Article.link == d.link)

    # If it is, skip it
    if result:
        logger.debug(f"Article already exists: {d.link}")
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
        logger.debug(f"Similar article found: {similarities[0].payload['link']}")

        Article.create(
            title=d.title,
            category=d.category,
            link=d.link,
            image=website_data["image"],
            important=False,
            published_at=datetime.fromtimestamp(time.mktime(d.published_parsed)),
        )

        return

    # Check importance
    today_date_str = datetime.now().strftime("%Y-%m-%d")
    news_text_with_meta = f"""
    Title: {d.title}
    Content: {content}
    Date: {today_date_str}
    """
    important = importance_check(news_text_with_meta)

    if not important:
        logger.debug(f"Article is not important: {d.link}")

        Article.create(
            title=d.title,
            category=d.category,
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
        link=d.link,
        category=d.category,
        image=website_data["image"],
        summary=summary,
        important=True,
        published_at=datetime.fromtimestamp(time.mktime(d.published_parsed)),
    )

    # Save to VectorDB
    vc_db.insert_news(News(title=website_data["title"], content=content, link=d.link))

    logger.success(f"Article saved: {d.link}\nTitle: {title}\nSummary: {summary}")

    send_pubsubhubbub_update(d.category)
