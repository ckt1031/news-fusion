from datetime import datetime

from loguru import logger
from openai.types import CreateEmbeddingResponse

from lib.api.llm import LLM
from lib.db.redis_client import get_article_redis_key, redis_client
from lib.handler.utils import evaluate_article_similarity, extract_url_contents
from lib.prompts import ImportanceSummaryMergedSchema, importance_summary_merged_prompt
from lib.rss import parse_rss_feed
from lib.scraper import extract_html_to_text
from lib.utils import optimize_text


async def get_reddit_content_with_comments(url: str) -> str | None:
    feed_data = parse_rss_feed(url + ".rss")

    if not feed_data or len(feed_data.entries) <= 1:
        logger.warning(f"No content found for {url}")
        return None

    content = ""

    is_first = True

    for entry in feed_data.entries:
        summary = extract_html_to_text(entry.summary)
        summary = optimize_text(summary)

        if is_first:
            # The first entry is the original post-content
            content += f"Reddit Post: {entry.title}\nContent: {summary}\n\nComments:\n"
            is_first = False
            continue

        content += f"- {summary}\n"

    article_content = await extract_url_contents(content)

    if article_content is None or len(article_content) == 0:
        # If the article content is not found, return the content without the article content
        return content

    return f"{content}\n\nArticle Contents:\n\n{article_content}"


async def handle_reddit(
    link: str,
    title: str,
    guid: str,
    category_config: dict[str, str | bool | None],
) -> dict | None:
    contents = await get_reddit_content_with_comments(link)

    if contents is None:
        return None

    computed_similarities = await evaluate_article_similarity(contents, guid, link)

    if computed_similarities["similar"]:
        # Reject if the Reddit post is similar to entry in the database
        return None

    content_embedding: CreateEmbeddingResponse = computed_similarities[
        "content_embedding"
    ]

    # Check importance
    today_date_str = datetime.now().strftime("%Y-%m-%d")
    content_with_meta = f"Title: {title}\nDate: {today_date_str}\nContent: {contents}"

    res = await LLM().generate_schema(
        user_message=content_with_meta,
        system_message=importance_summary_merged_prompt,
        schema=ImportanceSummaryMergedSchema,
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
