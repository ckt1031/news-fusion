import hashlib
import random
import time
from asyncio import sleep
from datetime import datetime, timezone
from urllib.parse import urlparse

import chevron
from loguru import logger

from lib.db.postgres import Article
from lib.db.qdrant import News, Qdrant
from lib.db.redis_client import redis_client
from lib.notifications.discord_webhook import send_discord
from lib.openai_api import MessageBody, OpenAIAPI, count_tokens
from lib.prompts import (
    NewsImportanceSchema,
    TitleSummarySchema,
    forum_importance_prompt,
    news_importance_prompt,
    summary_prompt,
)
from lib.prompts.title_summary import summary_with_comments_prompt
from lib.pubsub.subscription import send_pubsubhubbub_update
from lib.rss import extract_website, get_rss_config
from lib.types import RSSEntity
from lib.utils import optimize_text


def sha1_hash(text: str) -> str:
    return hashlib.sha1(text.encode()).hexdigest()


def get_redis_key(guid: str) -> str:
    return f"article_hash:{sha1_hash(guid)}"


async def is_article_checked(guid: str, link: str, title: str) -> bool:
    # We check the Redis cache to see if the article is already checked
    r_key = get_redis_key(guid)
    redis_exist = await redis_client.exists(r_key)

    if redis_exist:
        return True

    d = await Article.aio_get_or_none(
        (Article.guid == guid) | (Article.link == link) | (Article.title == title)
    )
    return d is not None


def is_host_the_same(link1: str, link2: str) -> bool:
    # Original: link1.split("/")[2] == link2.split("/")[2]
    return urlparse(link1).netloc == urlparse(link2).netloc


def parse_published_date(entry: dict) -> time.struct_time:
    published_key = [
        "published_parsed",
        "updated",
        "published",
    ]

    published = None

    for key in published_key:
        if key in entry:
            published = entry[key]
            break

    if not published:
        raise ValueError(f"No published date: {entry['link']}")

    if isinstance(published, str):
        # 2018-03-26T13:00:00.000Z
        published = time.strptime(published, "%Y-%m-%dT%H:%M:%S.%fZ")

    return published


def handle_comment(comment_url: str, selector: str) -> str:
    try:
        website_data = extract_website(comment_url, selector)
        return optimize_text(website_data["raw_text"])
    except Exception as e:
        logger.error(f"Failed to fetch the comment: {comment_url}")
        logger.error(e)
        return ""


async def check_article(d: RSSEntity) -> None:
    # Check if the article is older than 24 hours
    guid = d.entry["id"] if "id" in d.entry else d.entry["link"]
    link, title = d.entry["link"], d.entry["title"]
    published_parsed = parse_published_date(d.entry)  # struct_time

    timestamp = time.mktime(published_parsed)

    if (datetime.now() - datetime.fromtimestamp(timestamp)).days > 1:
        logger.debug(f"Article is older than 24 hours: {link}")
        return

    # Check if the source is already in the database
    if await is_article_checked(guid, link, title):
        logger.debug(f"Article already checked: {link} ({title})")
        return

    # Sleep for a random time between 2 and 5 seconds to avoid getting blocked and slowing down the server
    sleep_time = random.randint(1, 5)
    logger.debug(f"Sleeping for {sleep_time} seconds")
    await sleep(sleep_time)

    published_date = datetime.fromtimestamp(timestamp, tz=timezone.utc)

    logger.info(f"Checking article: {link} ({title})")

    openai = OpenAIAPI()

    website_data = extract_website(link)
    image = website_data["image"]

    content = optimize_text(website_data["raw_text"])
    content_token = count_tokens(content)
    if content_token > 8000:
        logger.warning(
            f"Article is too long: {link} ({content_token} tokens), currently not supported, skipping"
        )
        return

    category_config = get_rss_config()[d.category]
    similarity_check = category_config.get("similarity_check", True)
    content_embedding = None
    similarities = None

    qdrant = Qdrant()

    if similarity_check:
        content_embedding = await openai.generate_embeddings(content)

        # Check if the article is similar to any other article in the database to remove duplicates
        # If it is, skip it
        similarities = await qdrant.find_out_similar_news(
            News(
                content_embedding=content_embedding,
                link=link,
            )
        )

    r_key = get_redis_key(guid)

    # There exists a similar article from list and their host must be different
    if (
        content_embedding
        and similarities
        and similarities[0]
        and similarities[0].score >= 0.70
    ):
        # Set the key to Redis, expire in 96 hours, to avoid checking the same article again
        # EX in seconds: 96 hours * 60 minutes * 60 seconds
        await redis_client.set(r_key, 1, ex=96 * 60 * 60)

        logger.info(
            f"Similar article found for {link}: {similarities[0].payload['link']}"
        )
        return

    # Check importance
    today_date_str = datetime.now().strftime("%Y-%m-%d")
    news_text_with_meta = f"Title: {title}\nDate: {today_date_str}\nContent: {content}"

    is_forum: bool = category_config.get("forum", False)

    if category_config.get("importance_check", True):
        importance_status = await openai.generate_schema(
            MessageBody(
                system=forum_importance_prompt if is_forum else news_importance_prompt,
                user=news_text_with_meta,
            ),
            schema=NewsImportanceSchema,
        )

        # If the article is not important, skip it
        if not importance_status.important:
            # Set the key to Redis, expire in 96 hours, to avoid checking the same article again
            # EX in seconds: 96 hours * 60 minutes * 60 seconds
            await redis_client.set(r_key, 1, ex=96 * 60 * 60)
            logger.debug(f"Article not important: {link} ({title})")
            return

    _summary_prompt = summary_prompt

    if is_forum:
        _summary_prompt = summary_with_comments_prompt

        if "comments" in d.entry and "comment_selector" in category_config:
            comment_url = d.entry["comments"]
            comment_text = handle_comment(
                comment_url, category_config["comment_selector"]
            ).strip()

            if len(comment_text) > 0:
                content += f"\n\nComments: {comment_text}"

    # Generate title and summary
    generated_title_summary = await openai.generate_schema(
        MessageBody(
            system=chevron.render(
                summary_prompt,
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
        guid=guid,
        title=generated_title_summary.title,
        link=link,
        category=d.category,
        image=image,
        summary=generated_title_summary.summary,
        important=True,
        published_at=published_date,
        publisher=d.feed_title,
    )

    discord_channel_id = category_config.get("discord_channel_id")

    if discord_channel_id is not None and len(discord_channel_id) > 0:
        await send_discord(
            channel_id=discord_channel_id,
            message=None,
            embed={
                "title": data.title,
                "description": data.summary,
                "url": data.link,
                "footer": {"text": data.publisher},
                # Thumbnail
                "thumbnail": {"url": data.image},
            },
        )

    if content_embedding is not None and similarity_check:
        # Save to VectorDB
        await qdrant.insert_news(
            News(
                content_embedding=content_embedding,
                link=link,
            )
        )

    # Save to Postgres
    await data.aio_save()

    # Pubsub update for target clients
    await send_pubsubhubbub_update(d.category)

    logger.success(f"Article saved: {link}")
