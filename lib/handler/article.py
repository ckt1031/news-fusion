from datetime import datetime

import chevron
from loguru import logger
from openai.types import CreateEmbeddingResponse

from lib.db.qdrant import News, Qdrant
from lib.db.redis_client import get_article_redis_key, redis_client
from lib.openai_api import MessageBody, OpenAIAPI, count_tokens
from lib.prompts import (
    NewsImportanceSchema,
    forum_importance_prompt,
    news_importance_prompt,
    summary_prompt,
)
from lib.prompts.title_summary import TitleSummarySchema, summary_with_comments_prompt
from lib.scraper import extract_website
from lib.types import RSSEntity
from lib.utils import optimize_text


def handle_comment(comment_url: str, selector: str) -> str:
    try:
        website_data = extract_website(comment_url, selector)
        return optimize_text(website_data["raw_text"]).strip()
    except Exception as e:
        logger.error(f"Failed to fetch the comment: {comment_url}")
        logger.error(e)
        return ""


async def handle_article(
    d: RSSEntity,
    category_config: dict[str, str | bool | None],
) -> dict or None:
    link, title = d.entry["link"], d.entry["title"]
    guid = d.entry["id"] if "id" in d.entry else d.entry["link"]

    website_data = extract_website(link)
    image = website_data["image"]

    content = optimize_text(website_data["raw_text"]).strip()

    content_token = count_tokens(content)
    if content_token > 8000:
        logger.warning(
            f"Article is too long: {link} ({content_token} tokens), currently not supported, skipping"
        )
        return

    content_embedding: CreateEmbeddingResponse | None = None

    qdrant = Qdrant()
    openai = OpenAIAPI()

    # Cache key for quick redis checking without accessing the database
    article_cache_key = get_article_redis_key(guid)

    if category_config.get("similarity_check", True):
        content_embedding = await openai.generate_embeddings(content)

        # Check if the article is similar to any other article in the database to remove duplicates
        # If it is, skip it
        similarities = await qdrant.find_out_similar_news(
            News(
                link=link,
                content_embedding=content_embedding,
            )
        )

        # There exists a similar article from list and their host must be different
        if (
            content_embedding
            and similarities
            and similarities[0]
            # For entry above 0.75 threshold, consider it as similar
            and similarities[0].score >= 0.75
        ):
            # Set the key to Redis, expire in 96 hours, to avoid checking the same article again
            # EX in seconds: 96 hours * 60 minutes * 60 seconds
            await redis_client.set(article_cache_key, 1, ex=96 * 60 * 60)

            logger.info(
                f"Similar article found for {link}: {similarities[0].payload['link']}"
            )
            return

    # Check importance
    today_date_str = datetime.now().strftime("%Y-%m-%d")
    news_text_with_meta = f"Title: {title}\nDate: {today_date_str}\nContent: {content}"
    is_forum = category_config.get("forum", False)

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
            await redis_client.set(article_cache_key, 1, ex=96 * 60 * 60)

            logger.debug(f"Article not important: {link} ({title})")
            return

    new_summary_prompt = summary_prompt

    if is_forum:
        new_summary_prompt = summary_with_comments_prompt

        if "comments" in d.entry and "comment_selector" in category_config:
            comment_url = d.entry["comments"]
            comment_selector = category_config["comment_selector"]
            comment_text = handle_comment(comment_url, comment_selector)

            if len(comment_text) > 0:
                content += f"\n\nComments: {comment_text}"

    # Generate title and summary
    generated_title_summary = await openai.generate_schema(
        MessageBody(
            system=chevron.render(
                new_summary_prompt,
                {
                    "language": category_config.get("language", "English US"),
                },
            ),
            user=content,
        ),
        schema=TitleSummarySchema,
    )

    return {
        "image": image,
        "embedding": content_embedding,
        "content": generated_title_summary,
    }
