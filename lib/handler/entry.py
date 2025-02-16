import random
import time
import urllib.parse
from asyncio import sleep
from datetime import datetime, timezone

import validators
from loguru import logger

from lib.db.postgres import Article
from lib.db.qdrant import News, Qdrant
from lib.db.redis_client import get_article_redis_key, redis_client
from lib.handler.article import handle_article
from lib.handler.reddit import handle_reddit
from lib.handler.youtube import handle_youtube
from lib.notifications.discord import send_discord
from lib.openai_api import OpenAIAPI
from lib.prompts.categorize import CategorizeSchema, categorize_prompt
from lib.rss import (
    get_categories_with_description,
    get_rss_config,
    parse_published_date,
)
from lib.utils import get_source_name_from_cache


async def is_entry_checked(guid: str, link: str, title: str) -> bool:
    # We check the Redis cache to see if the article is already checked
    article_cache_key = get_article_redis_key(guid)
    redis_exist = await redis_client.exists(article_cache_key)

    if redis_exist:
        return True

    d = await Article.aio_get_or_none(
        (Article.guid == guid) | (Article.link == link) | (Article.title == title)
    )
    return d is not None


async def re_categorize(article: Article) -> str | None:
    user_prompt = f"Title: {article.title}\nSummary: {article.summary}"

    categories = [x["name"] for x in get_categories_with_description()]

    # Use OpenAI to re-categorize the article
    openai_api = OpenAIAPI()
    res = await openai_api.generate_schema(
        user_message=user_prompt,
        system_message=categorize_prompt,
        schema=CategorizeSchema,
    )

    return res.category if (res.category in categories) else article.category


def check_is_title_be_ignored(title: str, ignore_titles: list[str]) -> bool:
    for ignore_title in ignore_titles:
        if ignore_title.lower() in title.lower():
            return True

    return False


async def handle_entry(
    feed_title: str,
    feed_url: str,
    entry: dict,
    category: str,
    source_config: dict,
) -> None:
    # Check if the article is older than 24 hours
    guid = entry["id"] if "id" in entry else entry["link"]
    link, title = entry["link"], entry["title"]
    published_parsed = parse_published_date(entry)  # struct_time

    # Handle dates, in UTC for uniformity
    now_date_utc = datetime.now(timezone.utc)

    timestamp = time.mktime(published_parsed)
    published_date_utc = datetime.fromtimestamp(timestamp, tz=timezone.utc)

    if (now_date_utc - published_date_utc).days > 1:
        logger.debug(f"Entry is older than 24 hours: {link}")
        return

    if check_is_title_be_ignored(title, source_config["ignore_titles"]):
        logger.debug(f"Entry is ignored: {link} ({title})")
        return

    # Check if the source is already in the database
    if await is_entry_checked(guid, link, title):
        logger.debug(f"Entry already reviewed: {link} ({title})")
        return

    # Sleep for a random time between 2 and 5 seconds to avoid getting blocked and slowing down the server
    sleep_time = random.randint(1, 5)
    logger.debug(f"Sleeping for {sleep_time} seconds")
    await sleep(sleep_time)

    logger.info(f"Checking entry: {link} ({title})")

    category_config = get_rss_config()[category]

    if "youtube.com" in urllib.parse.urlparse(link).netloc:
        processed_data = await handle_youtube(
            link=link,
            title=title,
            guid=guid,
            entry=entry,
            category_config=category_config,
            published_date_utc=published_date_utc,
        )
    elif "reddit.com" in urllib.parse.urlparse(link).netloc:
        processed_data = await handle_reddit(
            link=link,
            title=title,
            guid=guid,
            category_config=category_config,
        )
    else:
        processed_data = await handle_article(
            link=link,
            title=title,
            guid=guid,
            entry=entry,
            category_config=category_config,
        )

    if processed_data is None:
        return

    image = processed_data["image"]
    generated_title_summary = processed_data["content"]
    publisher = get_source_name_from_cache(feed_url) or feed_title

    # Database schema insertion
    data = Article(
        guid=guid,
        title=generated_title_summary.title,
        link=link,
        category=category,
        image=image,
        summary=generated_title_summary.summary,
        important=True,
        published_at=now_date_utc,
        publisher=publisher,
    )

    # Check if the article is already in the database
    similarity_check = category_config.get("similarity_check", True)
    if "embedding" in processed_data and similarity_check:
        qdrant = Qdrant()
        # Save to VectorDB
        await qdrant.insert_news(
            News(
                content_embedding=processed_data["embedding"],
                link=link,
            )
        )

    # Re-categorize the article based on the content
    if source_config["re_categorize"]:
        # Re-categorize the article
        new_category = await re_categorize(data)

        if new_category != category and new_category is not None:
            logger.success(f"Re-categorize: {link} -> {new_category}")

            category = new_category
            data.category = new_category

    # Get the UPDATED category config
    category_config = get_rss_config()[category]

    # Save to Postgres
    await data.aio_save()

    # Set the key to Redis, expire in 72 hours
    article_cache_key = get_article_redis_key(guid)
    await redis_client.set(article_cache_key, 1, ex=72 * 60 * 60)

    # Send to Discord
    discord_channel_id: str | None = category_config.get("discord_channel_id")

    if discord_channel_id is not None and len(discord_channel_id) > 0:
        embed = {
            "url": data.link,
            "title": data.title,
            "description": data.summary,
            "footer": {"text": data.publisher},
        }

        if data.image and data.image.startswith("https") and validators.url(data.image):
            embed["thumbnail"] = {"url": data.image}

        await send_discord(
            discord_channel_id,
            embed=embed,
        )

    logger.success(f"Entry processed: {link}")
