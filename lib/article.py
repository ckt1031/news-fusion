import random
import time
from datetime import datetime
from time import sleep

import chevron
from loguru import logger

from lib.db.postgres import Article
from lib.db.qdrant import News, Qdrant
from lib.notifications.discord_webhook import send_discord
from lib.openai_api import MessageBody, OpenAIAPI, count_tokens
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
from lib.youtube import get_transcript_from_youtube_link


def check_if_article_exists(link: str) -> bool:
    return Article.get_or_none(Article.link == link) is not None


def is_host_the_same(link1: str, link2: str) -> bool:
    return link1.split("/")[2] == link2.split("/")[2]


def check_article(d: RSSEntity) -> None:
    # Check if the article is older than 24 hours
    timestamp = time.mktime(d.published_parsed)

    if (datetime.now() - datetime.fromtimestamp(timestamp)).days > 1:
        logger.debug(f"Article is older than 24 hours: {d.link}")
        return

    # Check if the source is already in the database
    if check_if_article_exists(d.link):
        logger.debug(f"Article already exists: {d.link}")
        return

    # Sleep for a random time between 2 and 5 seconds to avoid getting blocked and slowing down the server
    sleep_time = random.randint(1, 5)
    logger.debug(f"Sleeping for {sleep_time} seconds")
    sleep(sleep_time)

    is_youtube = False
    content_embedding = None
    published_date = datetime.fromtimestamp(time.mktime(d.published_parsed))

    qdrant = Qdrant()

    logger.info(f"Checking article: {d.link} ({d.title})")

    if "youtube.com" in d.link:
        is_youtube = True
        content = get_transcript_from_youtube_link(d.link)
        image = d.entry.get("media_thumbnail", [{}])[0].get("url", None)
    else:
        website_data = extract_website(d.link)
        image = website_data["image"]

        content = optimize_text(website_data["raw_text"])
        content_token = count_tokens(content)
        if content_token > 8000:
            logger.warning(
                f"Article is too long: {d.link} ({content_token} tokens), currently not supported, skipping"
            )
            return

        content_embedding = OpenAIAPI().generate_embeddings(content)

        # Check if the article is similar to any other article in the database to remove duplicates
        # If it is, skip it
        similarities = qdrant.find_out_similar_news(
            News(
                content_embedding=content_embedding,
                link=d.link,
            )
        )

        # There exists a similar article from list and their host must be different
        if similarities and similarities[0] and similarities[0].score >= 0.70 and not is_host_the_same(
                similarities[0].payload["link"], d.link
        ):
            Article.create(
                title=d.title,
                category=d.category,
                link=d.link,
                image=image,
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

    if not is_youtube:
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
                image=image,
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
        image=image,
        summary=generated_title_summary.summary,
        important=True,
        published_at=published_date,
        publisher=d.feed_title,
    )

    discord_channel_id: str = str(category_config.get("discord_channel_id"))

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

    if not is_youtube and content_embedding is not None:
        # Save to VectorDB
        qdrant.insert_news(
            News(
                content_embedding=content_embedding,
                link=d.link,
            )
        )

    # Save to Postgres
    data.save()

    # Pubsub update for target clients
    send_pubsubhubbub_update(d.category)

    logger.success(f"Article saved: {d.link}")
