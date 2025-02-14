from datetime import datetime

import chevron
import html2text
from loguru import logger
from openai.types import CreateEmbeddingResponse

from lib.db.redis_client import get_article_redis_key, redis_client
from lib.handler.article import str_list_to_points
from lib.handler.utils import similarity_check
from lib.openai_api import MessageBody, OpenAIAPI
from lib.prompts.extract_meta import ContentMetaExtraction, extract_content_meta_prompt
from lib.prompts.merge.importance_summary import (
    ImportanceMergedSchema,
    news_importance_summary_merged_prompt,
)
from lib.rss import get_rss_config, parse_rss_feed
from lib.scraper import extract_website
from lib.types import RSSEntity
from lib.utils import optimize_text


async def extract_url_contents(content: str) -> str:
    openai = OpenAIAPI()

    res = await openai.generate_schema(
        message=MessageBody(
            system=extract_content_meta_prompt,
            user=content,
        ),
        schema=ContentMetaExtraction,
    )

    article_urls = res.article_urls

    if not article_urls:
        return ""

    return get_article_contents(article_urls)


def get_article_contents(urls: list[str]) -> str:
    c = ""

    for url in urls:
        try:
            website_data = extract_website(url)
            c += optimize_text(website_data["raw_text"]).strip()
        except Exception as e:
            logger.warning(f"Failed to fetch the article: {url}")
            logger.error(e)
            continue

    return c


def get_content_with_comments(url: str) -> str:
    feed_url = url + ".rss"

    feed_data = parse_rss_feed(feed_url)

    if not feed_data or len(feed_data.entries) == 0:
        logger.info("No new entries found")
        return ""

    content = ""

    is_first = True

    for entry in feed_data.entries:
        summary = html2text.html2text(entry.summary)

        if is_first:
            content += f"Post: {entry.title}\nComment: "
            is_first = False
            continue

        content += f"{summary}\n"

    article_content = extract_url_contents(content)

    return f"{article_content}\n{content}"


async def handle_reddit(d: RSSEntity) -> dict | None:
    category_config = get_rss_config()[d.category]
    link, title = d.entry["link"], d.entry["title"]
    guid = d.entry["id"] if "id" in d.entry else d.entry["link"]

    contents = get_content_with_comments(link)

    # Check importance
    today_date_str = datetime.now().strftime("%Y-%m-%d")
    content_with_meta = f"Title: {title}\nDate: {today_date_str}\nContent: {contents}"

    openai_api = OpenAIAPI()

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

    res = await openai_api.generate_schema(
        MessageBody(
            system=sys_prompt,
            user=content_with_meta,
        ),
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
