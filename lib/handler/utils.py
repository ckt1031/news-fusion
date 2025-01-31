from langchain_text_splitters import TokenTextSplitter
from loguru import logger

from lib.db.qdrant import News, Qdrant
from lib.db.redis_client import get_article_redis_key, redis_client
from lib.openai_api import OpenAIAPI


def split_text_by_token(text: str, token_limit: int) -> list[str]:
    text_splitter = TokenTextSplitter.from_tiktoken_encoder(
        encoding_name="o200k_base", chunk_size=token_limit, chunk_overlap=0
    )
    texts = text_splitter.split_text(text)

    return texts


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

        logger.success(
            f"Similar ({similarities[0].score * 100}%): {link} -> {similarities[0].payload['link']}"
        )
        return {"similar": True}

    return {"similar": False, "content_embedding": content_embedding}
