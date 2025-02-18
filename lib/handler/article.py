from datetime import datetime

import chevron
import html2text
from loguru import logger
from openai.types import CreateEmbeddingResponse

from lib.db.redis_client import get_article_redis_key, redis_client
from lib.handler.utils import similarity_check, split_text_by_token
from lib.openai_api import OpenAIAPI, count_tokens
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
from lib.utils import optimize_text


def handle_comment(comment_url: str, selector: str) -> str | None:
    try:
        website_data = extract_website(comment_url, selector)
        return optimize_text(website_data["raw_text"]).strip()
    except Exception as e:
        logger.warning(f"Failed to fetch the comment: {comment_url}")
        logger.error(e)
        return None


def extract_rss_content(entry: dict) -> str:
    if "content" in entry:
        return entry["content"][0]["value"]

    return entry["summary"]


def extract_rss_image(entry: dict) -> str | None:
    if "media_thumbnail" in entry:
        return entry["media_thumbnail"][0]["url"]
    elif "media_content" in entry:
        return entry["media_content"][0]["url"]
    return None


def str_list_to_points(lst: list[str]) -> str:
    return "\n".join([f"- {x}" for x in lst])


async def handle_article(
    link: str,
    title: str,
    guid: str,
    entry: dict,
    category_config: dict[str, str | bool | None],
    source_config: dict[str, str | bool | None],
) -> dict | None:
    if source_config["scrape_needed"]:
        website_data = extract_website(link)
        site_text = website_data["raw_text"]
        image = website_data["image"]
    else:
        # We can use the RSS field instead of scraping
        site_text = extract_rss_content(entry)
        site_text = html2text.html2text(site_text)
        image = extract_rss_image(entry)

    content = optimize_text(site_text).strip()
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
            return None

        content_embedding = e["content_embedding"]

    # Check importance
    today_date_str = datetime.now().strftime("%Y-%m-%d")
    content_with_meta = f"Title: {title}\nDate: {today_date_str}\nContent: {content}"
    is_forum = category_config.get("forum", False)

    comments = None

    # Scrape comments if available
    if is_forum:
        if "comments" in entry and "comment_selector" in category_config:
            comment_url = entry["comments"]  # RSS Tag
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

        sys_prompt = chevron.render(
            sys_prompt,
            {
                "accept_news_criterias": str_list_to_points(
                    category_config.get("accept_news_criterias", [])
                ),
                "reject_news_criterias": str_list_to_points(
                    category_config.get("reject_news_criterias", [])
                ),
            },
        )

        if comments:
            sys_prompt += comments_summary_additional_prompt

        res = await openai_api.generate_schema(
            user_message=content_with_meta,
            system_message=sys_prompt,
            schema=ImportanceMergedSchema,
        )

        # If the article is not important, skip it
        if not res.important:
            # Set the key to Redis, expire in 96 hours, to avoid checking the same article again
            # EX in seconds: 96 hours * 60 minutes * 60 seconds
            await redis_client.set(article_cache_key, 1, ex=96 * 60 * 60)

            logger.info(f"Article not important: {link} ({title})")
            return None

        # If the article is important, generate the title and summary
        return {
            "image": image,
            "embedding": content_embedding,
            "content": res,
        }

    # Generate title and summary
    res = await openai_api.generate_schema(
        user_message=content_with_meta,
        system_message=(
            summary_prompt + comments_summary_additional_prompt
            if comments
            else summary_prompt
        ),
        schema=TitleSummarySchema,
    )

    return {
        "image": image,
        "embedding": content_embedding,
        "content": res,
    }
