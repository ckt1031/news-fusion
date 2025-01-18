import asyncio
import datetime

from loguru import logger

from lib.db.postgres import Article, close_db
from lib.utils import init_logger

init_logger()


async def remove_expired_articles():
    IMPORTANT_NEWS_EXPIRATION_DAYS = 30

    exceed_date = datetime.datetime.now() - datetime.timedelta(
        days=IMPORTANT_NEWS_EXPIRATION_DAYS
    )

    await Article.delete().where(
        Article.created_at.day <= exceed_date.day
        and Article.created_at.month <= exceed_date.month
        and Article.created_at.year <= exceed_date.year
    ).aio_execute()

    logger.success("Expired articles removed")

    NOT_IMPORTANT_NEWS_EXPIRATION_DAYS = 4

    exceed_date = datetime.datetime.now() - datetime.timedelta(
        days=NOT_IMPORTANT_NEWS_EXPIRATION_DAYS
    )

    await Article.delete().where(
        Article.created_at.day <= exceed_date.day
        and Article.created_at.month <= exceed_date.month
        and Article.created_at.year <= exceed_date.year
        and Article.important is False
    ).aio_execute()

    logger.success("Expired non-important articles removed")


if __name__ == "__main__":
    asyncio.run(remove_expired_articles())
    close_db()
