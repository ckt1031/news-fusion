from langchain_text_splitters import TokenTextSplitter
from loguru import logger

from lib.config import SIMILARITY_THRESHOLD
from lib.db.qdrant import News, Qdrant
from lib.db.redis_client import get_article_redis_key, redis_client
from lib.openai_api import TOKEN_ENCODER, OpenAIAPI
from lib.prompts.extract_meta import ContentMetaExtraction, extract_content_meta_prompt
from lib.scraper import extract_website
from lib.utils import get_host_from_url, optimize_text


def split_text_by_token(text: str, token_limit: int) -> list[str]:
    text_splitter = TokenTextSplitter.from_tiktoken_encoder(
        encoding_name=TOKEN_ENCODER,
        chunk_size=token_limit,
        chunk_overlap=0,
    )
    return text_splitter.split_text(text)


def host_same(link: str, second_link: str) -> bool:
    return get_host_from_url(link) == get_host_from_url(second_link)


async def similarity_check(content: str, guid: str, link: str) -> dict:
    article_cache_key = get_article_redis_key(guid)

    # TODO Split and process if the content is longer than 8000 tokens
    content_embedding = await OpenAIAPI().generate_embeddings(content)

    # Check if the article is similar to any other article in the database to remove duplicates
    # If it is, skip it
    similarities = await Qdrant().find_out_similar_news(content_embedding)

    if similarities:
        # Find out the most similar article
        similarities_results = [
            x
            for x in similarities
            if x.score >= SIMILARITY_THRESHOLD
            and not host_same(link, x.payload["link"])
        ]

        if len(similarities_results) > 0:
            # Set the key to Redis, expire in 96 hours, to avoid checking the same article again
            # EX in seconds: 96 hours * 60 minutes * 60 seconds
            await redis_client.set(article_cache_key, 1, ex=96 * 60 * 60)

            for x in similarities_results:
                logger.success(
                    f"Similar ({x.score * 100}%): {link} -> {x.payload['link']}"
                )

            return {"similar": True}

    return {"similar": False, "content_embedding": content_embedding}


async def extract_url_contents(content: str) -> str | None:
    res = await OpenAIAPI().generate_schema(
        user_message=content,
        system_message=extract_content_meta_prompt,
        schema=ContentMetaExtraction,
    )

    return get_article_contents(res.article_urls) if res.article_urls else None


def get_article_contents(urls: list[str]) -> str:
    content = ""

    for url in urls:
        try:
            website_data = extract_website(url)
            content += optimize_text(website_data["raw_text"]).strip()
        except Exception as e:
            logger.warning(f"Failed to fetch the article: {url}")
            logger.error(e)
            continue

    return content
