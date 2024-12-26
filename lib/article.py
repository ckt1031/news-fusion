import random
import time
from datetime import datetime
from time import sleep

import chevron
from loguru import logger

from lib.db.postgres import Article
from lib.db.qdrant import News, Qdrant
from lib.notifications.discord_webhook import send_discord
from lib.openai_api import MessageBody, OpenAIAPI
from lib.prompts import (
    NewsImportanceSchema,
    TitleSummarySchema,
    forum_importance_prompt,
    news_importance_prompt,
    title_summary_prompt,
)
from lib.pubsub.subscription import send_pubsubhubbub_update
from lib.rss import extract_website, get_rss_config
from lib.types import RSSEntity
from lib.utils import optimize_text


def check_if_article_exists(link: str) -> bool:
    return Article.get_or_none(Article.link == link) is not None


def check_article(d: RSSEntity) -> None:
    # Check if the article is older than 3 days
    timestamp = time.mktime(d.published_parsed)

    if (datetime.now() - datetime.fromtimestamp(timestamp)).days > 3:
        logger.debug(f"Article is older than 3 days: {d.link}")
        return

    # Check if the source is already in the database
    if check_if_article_exists(d.link):
        logger.debug(f"Article already exists: {d.link}")
        return

    # Sleep for a random time between 2 and 5 seconds to avoid getting blocked and slowing down the server
    sleep_time = random.randint(1, 5)
    logger.debug(f"Sleeping for {sleep_time} seconds")
    sleep(sleep_time)

    website_data = extract_website(d.link)
    content = optimize_text(website_data["raw_text"])
    content_embedding = OpenAIAPI().generate_embeddings(content)

    # Check if the article is similar to any other article in the database to remove duplicates
    # If it is, skip it
    qdrant = Qdrant()
    similarities = qdrant.find_out_similar_news(
        News(
            content_embedding=content_embedding,
            title=website_data["title"],
            link=d.link,
        )
    )

    published_date = datetime.fromtimestamp(time.mktime(d.published_parsed))

    # There exists a similar article from list with a score of 0.75 or higher
    if similarities and similarities[0] and similarities[0].score >= 0.70:
        Article.create(
            title=d.title,
            category=d.category,
            link=d.link,
            image=website_data["image"],
            important=False,
            published_at=published_date,
        )
        logger.debug(
            f"Similar article found for {d.link}: {similarities[0].payload['link']}"
        )
        return

    # Check importance
    today_date_str = datetime.now().strftime("%Y-%m-%d")
    news_text_with_meta = (
        f"Title: {d.title}\nDate: {today_date_str}\nContent: {content}"
    )

    category_config = get_rss_config()[d.category]
    is_forum: bool = category_config.get("forum", False)

    importance_status = OpenAIAPI().generate_schema(
        MessageBody(
            system=forum_importance_prompt if is_forum else news_importance_prompt,
            user=news_text_with_meta,
        ),
        schema=NewsImportanceSchema,
    )

    # If the article is not important, skip it
    if not importance_status.important:
        Article.create(
            title=d.title,
            category=d.category,
            link=d.link,
            image=website_data["image"],
            important=False,
            published_at=published_date,
        )
        logger.debug(f"Article is not important: {d.link}")
        return

    # Generate title and summary
    generated_title_summary = OpenAIAPI().generate_schema(
        MessageBody(
            system=chevron.render(
                title_summary_prompt,
                {
                    "language": category_config.get("language", "English US"),
                },
            ),
            user=content,
        ),
        schema=TitleSummarySchema,
    )

    # Database schema insertion
    data = Article(
        title=generated_title_summary.title,
        link=d.link,
        category=d.category,
        image=website_data["image"],
        summary=generated_title_summary.summary,
        important=True,
        published_at=published_date,
        publisher=d.feed_title,
    )

    discord_channel_id: str = category_config.get("discord_channel_id")

    if discord_channel_id is not None and len(discord_channel_id) > 0:
        send_discord(
            channel_id=discord_channel_id,
            message=None,
            embed={
                "title": data.title,
                "description": data.summary,
                "url": data.link,
                "image": {"url": data.image},
                "footer": {"text": data.publisher},
            },
        )

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

    # Pubsub update for target clients
    send_pubsubhubbub_update(d.category)

    logger.success(f"Article saved: {d.link}")
