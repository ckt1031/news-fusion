import random
import time
from asyncio import sleep
from datetime import datetime, timezone

from loguru import logger

from lib.db.postgres import Article
from lib.db.qdrant import News, Qdrant
from lib.db.redis_client import get_article_redis_key, redis_client
from lib.handler.article import handle_article
from lib.handler.youtube import handle_youtube
from lib.notifications.discord import send_discord
from lib.pubsub.subscription import send_pubsubhubbub_update
from lib.rss import get_rss_config, parse_published_date
from lib.types import RSSEntity


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


async def handle_entry(d: RSSEntity) -> None:
    # Check if the article is older than 24 hours
    guid = d.entry["id"] if "id" in d.entry else d.entry["link"]
    link, title = d.entry["link"], d.entry["title"]
    published_parsed = parse_published_date(d.entry)  # struct_time

    # Handle dates, in UTC for uniformity
    now_date_utc = datetime.now(timezone.utc)

    timestamp = time.mktime(published_parsed)
    published_date_utc = datetime.fromtimestamp(timestamp, tz=timezone.utc)

    if (now_date_utc - published_date_utc).days > 1:
        logger.debug(f"Entry is older than 24 hours: {link}")
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

    category_config = get_rss_config()[d.category]

    if "youtube.com" in link:
        processed_data = await handle_youtube(d, category_config, published_date_utc)
    else:
        processed_data = await handle_article(d, category_config)

    if processed_data is None:
        return

    image = processed_data["image"]
    generated_title_summary = processed_data["content"]

    # Database schema insertion
    data = Article(
        guid=guid,
        title=generated_title_summary.title,
        link=link,
        category=d.category,
        image=image,
        summary=generated_title_summary.summary,
        important=True,
        published_at=published_date_utc,
        publisher=d.feed_title,
    )

    discord_channel_id = category_config.get("discord_channel_id")

    if discord_channel_id is not None and len(discord_channel_id) > 0:
        embed = {
            "url": data.link,
            "title": data.title,
            "description": data.summary,
            "footer": {"text": data.publisher},
        }

        if data.image and data.image.startswith("https"):
            embed["thumbnail"] = {"url": data.image}

        await send_discord(
            discord_channel_id,
            embed=embed,
        )

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

    # Save to Postgres
    await data.aio_save()

    # Pubsub update for target clients
    await send_pubsubhubbub_update(d.category)

    # Set the key to Redis, expire in 72 hours
    article_cache_key = get_article_redis_key(guid)
    await redis_client.set(article_cache_key, 1, ex=72 * 60 * 60)

    logger.success(f"Entry processed: {link}")
