import asyncio
from datetime import datetime, timedelta

from loguru import logger
from qdrant_client import models

from lib.db.postgres import Article, close_db
from lib.db.qdrant import Qdrant
from lib.utils import init_logger

init_logger()


exceed_30d_date = datetime.now() - timedelta(days=30)


async def deleteOldQdrantCollection():
    qdrant = Qdrant()

    await qdrant.delete(
        models.Filter(
            must=[
                # models.IsEmptyCondition(
                #     # Datetime field was added on 2025-01-27, so we will delete all records without this field on 2025-03-01
                #     is_empty=models.PayloadField(key="created_at"),
                # )
                models.FieldCondition(
                    key="date",
                    range=models.DatetimeRange(
                        lte=exceed_30d_date,
                    ),
                )
            ]
        )
    )


async def remove_expired_articles():
    # Remove all entries older than 30 days
    await Article.delete().where(Article.created_at <= exceed_30d_date).aio_execute()

    logger.success("All articles saved for more than 30 days removed")

    exceed_date = datetime.now() - timedelta(days=3)

    # NOT IMPORTANT
    await Article.delete().where(
        (Article.created_at <= exceed_date) & (Article.important == False)  # noqa: E712
    ).aio_execute()

    logger.success("All not important articles saved for more than 3 days removed")


if __name__ == "__main__":
    asyncio.run(remove_expired_articles())
    asyncio.run(deleteOldQdrantCollection())
    close_db()
