import urllib.parse

from langchain_text_splitters import TokenTextSplitter
from loguru import logger

from lib.db.qdrant import News, Qdrant
from lib.db.redis_client import get_article_redis_key, redis_client
from lib.openai_api import TOKEN_ENCODER, OpenAIAPI
from lib.prompts.extract_meta import ContentMetaExtraction, extract_content_meta_prompt
from lib.scraper import extract_website
from lib.utils import optimize_text


def split_text_by_token(text: str, token_limit: int) -> list[str]:
    text_splitter = TokenTextSplitter.from_tiktoken_encoder(
        encoding_name=TOKEN_ENCODER,
        chunk_size=token_limit,
        chunk_overlap=0,
    )
    texts = text_splitter.split_text(text)

    return texts


def host_same(link: str, link2: str) -> bool:
    return urllib.parse.urlparse(link).netloc == urllib.parse.urlparse(link2).netloc


async def similarity_check(content: str, guid: str, link: str) -> dict | None:
    qdrant = Qdrant()
    openai_api = OpenAIAPI()

    article_cache_key = get_article_redis_key(guid)

    content_embedding = await openai_api.generate_embeddings(content)

    # Check if the article is similar to any other article in the database to remove duplicates
    # If it is, skip it
    similarities = await qdrant.find_out_similar_news(
        News(
            link=link,
            content_embedding=content_embedding,
        )
    )

    if similarities:
        THRESHOLD = 0.80

        above_75_and_different_host = [
            x
            for x in similarities
            if x.score >= THRESHOLD and not host_same(link, x.payload["link"])
        ]

        if len(above_75_and_different_host) > 0:
            # Set the key to Redis, expire in 96 hours, to avoid checking the same article again
            # EX in seconds: 96 hours * 60 minutes * 60 seconds
            await redis_client.set(article_cache_key, 1, ex=96 * 60 * 60)

            for x in above_75_and_different_host:
                logger.success(
                    f"Similar ({x.score * 100}%): {link} -> {x.payload['link']}"
                )

            return {"similar": True}

    return {"similar": False, "content_embedding": content_embedding}


async def extract_url_contents(content: str) -> str:
    openai = OpenAIAPI()

    res = await openai.generate_schema(
        user_message=content,
        system_message=extract_content_meta_prompt,
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
