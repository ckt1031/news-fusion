import random
import time
from datetime import datetime
from time import sleep

from loguru import logger
from openai import BaseModel

from lib.db.postgres import Article
from lib.db.qdrant import News, Qdrant
from lib.notifications.send import process_notification
from lib.openai_api import MessageBody, OpenAIAPI
from lib.prompts import (
    forum_importance_prompt,
    news_importance_prompt,
    short_summary_prompt,
    title_generation_prompt,
)
from lib.prompts.title_summary import title_summary_prompt
from lib.pubsub.subscription import send_pubsubhubbub_update
from lib.rss import extract_website, get_rss_config
from lib.utils import optimize_text


class TitleSummarySchema(BaseModel):
    title: str
    summary: str


class RSSEntity:
    def __init__(
        self,
        title: str,
        link: str,
        published_parsed: time.struct_time,
        category: str,
        feed_title: str,
    ):
        self.title = title
        self.link = link
        self.published_parsed = published_parsed
        self.category = category
        self.feed_title = feed_title


def generate_summary(content: str) -> str:
    msg = MessageBody(
        system=short_summary_prompt,
        user=content,
    )
    return OpenAIAPI().generate_text(msg)


def generate_title(content: str) -> str:
    msg = MessageBody(
        system=title_generation_prompt,
        user=content,
    )
    return OpenAIAPI().generate_text(msg)


def importance_check(content: str, is_forum: bool) -> bool:
    msg = MessageBody(
        system=forum_importance_prompt if is_forum else news_importance_prompt,
        user=content,
    )
    response = OpenAIAPI().generate_text(msg).lower()

    return ("true" in response) or ("important" in response)


def check_if_article_exists(link: str, title: str) -> bool:
    return (
        Article.get_or_none(Article.link == link or Article.title == title) is not None
    )


def check_article(d: RSSEntity) -> None:
    # Check if the article is older than 3 days
    timestamp = time.mktime(d.published_parsed)

    if (datetime.now() - datetime.fromtimestamp(timestamp)).days > 3:
        logger.debug(f"Article is older than 3 days: {d.link}")
        return

    # Check if the source is already in the database
    if check_if_article_exists(d.link, d.title):
        logger.debug(f"Article already exists: {d.link}")
        return

    # Sleep for a random time between 2 and 5 seconds to avoid getting blocked and slowing down the server
    sleep_time = random.randint(1, 5)
    logger.debug(f"Sleeping for {sleep_time} seconds")
    sleep(sleep_time)

    website_data = extract_website(d.link)

    content = optimize_text(website_data["raw_text"])

    qdrant = Qdrant()

    content_embedding = OpenAIAPI().generate_embeddings(content)

    # Check if the article is similar to any other article in the database to remove duplicates
    # If it is, skip it
    similarities = qdrant.find_out_similar_news(
        News(
            content_embedding=content_embedding,
            title=website_data["title"],
            link=d.link,
        )
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
    rss_config = get_rss_config()
    category_config = rss_config[d.category]
    forum_mode: bool = category_config.get("forum", False)
    important = importance_check(news_text_with_meta, forum_mode)

    published_date = datetime.fromtimestamp(time.mktime(d.published_parsed))

    # If the article is not important, skip it
    if not important:
        logger.debug(f"Article is not important: {d.link}")

        Article.create(
            title=d.title,
            category=d.category,
            link=d.link,
            image=website_data["image"],
            important=False,
            published_at=published_date,
        )

        return

    generated_data = (
        OpenAIAPI()
        .generate_schema(
            MessageBody(
                system=title_summary_prompt,
                user=content,
            ),
            schema=TitleSummarySchema,
        )
        .parsed
    )

    data = Article(
        title=generated_data.title,
        link=d.link,
        category=d.category,
        image=website_data["image"],
        summary=generated_data.summary,
        important=True,
        published_at=published_date,
        publisher=d.feed_title,
    )

    process_notification(data, rss_config[d.category])

    # Save to VectorDB
    qdrant.insert_news(
        News(
            title=website_data["title"],
            content_embedding=content_embedding,
            link=d.link,
        )
    )

    # Save to Postgres
    data.save()

    logger.success(f"Article saved: {d.link}")

    send_pubsubhubbub_update(d.category)
