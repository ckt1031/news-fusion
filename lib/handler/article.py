from datetime import datetime

from loguru import logger
from openai.types import CreateEmbeddingResponse

from lib.db.redis_client import get_article_redis_key, redis_client
from lib.handler.utils import similarity_check, split_text_by_token
from lib.openai_api import MessageBody, OpenAIAPI, count_tokens
from lib.prompts import summary_prompt
from lib.prompts.merge.importance_summary import (
    ImportanceMergedSchema,
    forum_importance_summary_merged_prompt,
    news_importance_summary_merged_prompt,
)
from lib.prompts.title_summary import (
    TitleSummarySchema,
    comments_summary_additional_prompt,
)
from lib.scraper import extract_website
from lib.types import RSSEntity
from lib.utils import optimize_text


def handle_comment(comment_url: str, selector: str) -> str | None:
    try:
        website_data = extract_website(comment_url, selector)
        return optimize_text(website_data["raw_text"]).strip()
    except Exception as e:
        logger.warning(f"Failed to fetch the comment: {comment_url}")
        logger.error(e)
        return None


async def handle_article(
    d: RSSEntity,
    category_config: dict[str, str | bool | None],
) -> dict | None:
    link, title = d.entry["link"], d.entry["title"]
    guid = d.entry["id"] if "id" in d.entry else d.entry["link"]

    website_data = extract_website(link)
    image = website_data["image"]

    content = optimize_text(website_data["raw_text"]).strip()
    content_token = count_tokens(content)
    reduced_content = content

    # If the content is extremely long, reduce it
    if content_token > 20000:
        texts = split_text_by_token(content, 19000)
        logger.warning(
            f"Article is extremely long: {link} ({content_token} tokens), only first part will be processed"
        )
        content = texts[0]

        # Reduce the content to 8000 tokens
        reduced_content = split_text_by_token(content, 7500)[0]
    elif content_token > 8000:
        texts = split_text_by_token(content, 7500)
        logger.warning(
            f"Article is too long: {link} ({content_token} tokens), only first part will be processed"
        )
        reduced_content = texts[0]

    content_embedding: CreateEmbeddingResponse | None = None

    openai_api = OpenAIAPI()

    # Cache key for quick redis checking without accessing the database
    article_cache_key = get_article_redis_key(guid)

    if category_config.get("similarity_check", True):
        # TODO: Support for multiple splits
        e = await similarity_check(reduced_content, guid, link)

        if e["similar"]:
            return

        content_embedding = e["content_embedding"]

    # Check importance
    today_date_str = datetime.now().strftime("%Y-%m-%d")
    content_with_meta = f"Title: {title}\nDate: {today_date_str}\nContent: {content}"
    is_forum = category_config.get("forum", False)

    comments = None

    # Scrape comments if available
    if is_forum:
        if "comments" in d.entry and "comment_selector" in category_config:
            comment_url = d.entry["comments"]  # RSS Tag
            comment_selector = category_config["comment_selector"]  # Config
            comments = handle_comment(comment_url, comment_selector)

            if comments:
                # Add comments to the text
                content_with_meta += f"\nComments: {comments}"

    if category_config.get("importance_check", True):
        sys_prompt = (
            forum_importance_summary_merged_prompt
            if is_forum
            else news_importance_summary_merged_prompt
        )

        if comments:
            sys_prompt += comments_summary_additional_prompt

        res = await openai_api.generate_schema(
            MessageBody(
                system=sys_prompt,
                user=content_with_meta,
            ),
            schema=ImportanceMergedSchema,
        )

        # If the article is not important, skip it
        if not res.important:
            # Set the key to Redis, expire in 96 hours, to avoid checking the same article again
            # EX in seconds: 96 hours * 60 minutes * 60 seconds
            await redis_client.set(article_cache_key, 1, ex=96 * 60 * 60)

            logger.debug(f"Article not important: {link} ({title})")
            return

        # If the article is important, generate the title and summary
        return {
            "image": image,
            "embedding": content_embedding,
            "content": res,
        }

    # Generate title and summary
    res = await openai_api.generate_schema(
        MessageBody(
            system=(
                (summary_prompt + comments_summary_additional_prompt)
                if comments
                else summary_prompt
            ),
            user=content_with_meta,
        ),
        schema=TitleSummarySchema,
    )

    return {
        "image": image,
        "embedding": content_embedding,
        "content": res,
    }
