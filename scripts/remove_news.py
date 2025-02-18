import asyncio

from loguru import logger
from qdrant_client import models

from lib.db.postgres import Article, close_db
from lib.db.qdrant import Qdrant
from lib.utils import init_logger

init_logger()


async def remove_news():
    user_input = input("Enter the URL or the ID of the news you want to remove: ")

    qdrant = Qdrant()

    if user_input.startswith("https://"):
        # Remove the news by URL
        await Article.delete().where(Article.link == user_input).aio_execute()

        await qdrant.delete(
            models.Filter(
                must=[
                    models.FieldCondition(
                        key="link",
                        match=models.MatchValue(value=user_input),
                    ),
                ]
            )
        )
    else:
        # Remove the news by ID
        # Find the article by ID
        article = await Article.find_one(Article.id == user_input)

        if article:
            await Article.delete().where(Article.id == user_input).aio_execute()

            await qdrant.delete(
                models.Filter(
                    must=[
                        models.FieldCondition(
                            key="link", match=models.MatchValue(value=article.link)
                        ),
                    ]
                )
            )

    logger.success("News removed")


if __name__ == "__main__":
    asyncio.run(remove_news())
    close_db()
