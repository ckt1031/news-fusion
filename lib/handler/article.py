from datetime import datetime

from loguru import logger
from openai.types import CreateEmbeddingResponse

from lib.api.hackernews import get_hn_comments
from lib.api.llm import LLM, count_tokens
from lib.api.lobste import get_lobsters_comments
from lib.db.redis_client import get_article_redis_key, redis_client
from lib.handler.utils import evaluate_article_similarity, split_text_by_token
from lib.prompts import (
    ImportanceSummaryMergedSchema,
    TitleSummarySchema,
    comments_summary_additional_prompt,
    importance_summary_merged_prompt,
    summary_prompt,
)
from lib.scraper import extract_html_to_text, extract_website
from lib.utils import optimize_text


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
        site_text = extract_html_to_text(site_text)
        image = extract_rss_image(entry)

    content = optimize_text(site_text).strip()
    content_token = count_tokens(content)

    # Copy the content to the reduced_content
    reduced_content = str(content)

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

    # Cache key for quick redis checking without accessing the database
    article_cache_key = get_article_redis_key(guid)

    # Check if the article is already in the vector database
    # TODO: Support for multiple splits
    e = await evaluate_article_similarity(reduced_content, guid, link)

    if e["similar"]:
        return None

    content_embedding = e["content_embedding"]

    # Check importance
    today_date_str = datetime.now().strftime("%Y-%m-%d")
    content_with_meta = f"Title: {title}\nDate: {today_date_str}\nContent: {content}"

    comments = None

    # Scrape comments if available
    if "news.ycombinator.com" in link:
        comments = get_hn_comments(link)
    elif "lobste.rs" in link:
        comments = get_lobsters_comments(link)

    if comments is not None and len(comments) > 0:
        # Add comments to the text
        content_with_meta += f"\n\n---- Discussion and Comments ----\n\n{comments}"

    openai_api = LLM()

    if category_config.get("importance_check", True):
        sys_prompt = str(importance_summary_merged_prompt)  # Copy the prompt

        if comments:
            sys_prompt += comments_summary_additional_prompt

        res = await openai_api.generate_schema(
            user_message=content_with_meta,
            system_message=sys_prompt,
            schema=ImportanceSummaryMergedSchema,
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
