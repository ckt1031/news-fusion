from datetime import datetime

import chevron
import html2text
from loguru import logger
from openai.types import CreateEmbeddingResponse

from lib.db.redis_client import get_article_redis_key, redis_client
from lib.handler.article import str_list_to_points
from lib.handler.utils import extract_url_contents, similarity_check
from lib.openai_api import OpenAIAPI
from lib.prompts.merge.importance_summary import (
    ImportanceMergedSchema,
    news_importance_summary_merged_prompt,
)
from lib.rss import parse_rss_feed


async def get_reddit_content_with_comments(url: str) -> str | None:
    feed_url = url + ".rss"

    feed_data = parse_rss_feed(feed_url)

    if not feed_data or len(feed_data.entries) == 0:
        logger.warning(f"No content found for {url}")
        return None

    content = ""

    is_first = True

    # If the only 1 entry, means that the post has no comments
    if len(feed_data.entries) == 1:
        logger.warning(f"No comments found for {url}")
        return None

    for entry in feed_data.entries:
        summary = html2text.html2text(entry.summary)

        if is_first:
            content += f"Post: {entry.title}\nComment: "
            is_first = False
            continue

        content += f"{summary}\n"

    article_content = await extract_url_contents(content)

    if article_content is None:
        # If the article content is not found, return the content without the article content
        return content

    return f"{article_content}\n{content}"


async def handle_reddit(
    link: str,
    title: str,
    guid: str,
    category_config: dict[str, str | bool | None],
) -> dict | None:
    contents = await get_reddit_content_with_comments(link)

    if contents is None:
        return None

    # Check importance
    today_date_str = datetime.now().strftime("%Y-%m-%d")
    content_with_meta = f"Title: {title}\nDate: {today_date_str}\nContent: {contents}"

    sc = await similarity_check(contents, guid, link)

    if sc["similar"]:
        # Check if the article is already checked in the similarity check
        return None

    content_embedding: CreateEmbeddingResponse = sc["content_embedding"]

    sys_prompt = chevron.render(
        news_importance_summary_merged_prompt,
        {
            "accept_news_criterias": str_list_to_points(
                category_config.get("accept_news_criterias", [])
            ),
            "reject_news_criterias": str_list_to_points(
                category_config.get("reject_news_criterias", [])
            ),
        },
    )

    res = await OpenAIAPI().generate_schema(
        user_message=content_with_meta,
        system_message=sys_prompt,
        schema=ImportanceMergedSchema,
    )

    # If the article is not important, skip it
    if not res.important:
        # Cache key for quick redis checking without accessing the database
        article_cache_key = get_article_redis_key(guid)
        # Set the key to Redis, expire in 96 hours, to avoid checking the same article again
        # EX in seconds: 96 hours * 60 minutes * 60 seconds
        await redis_client.set(article_cache_key, 1, ex=96 * 60 * 60)

        logger.info(f"Reddit not important: {link} ({title})")
        return None

    return {
        "image": None,  # TODO: Add image
        "embedding": content_embedding,
        "content": res,
    }
