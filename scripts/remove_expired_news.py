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

    await Article.delete().where(Article.created_at <= exceed_date).aio_execute()

    logger.success("All articles saved for more than 30 days removed")

    NOT_IMPORTANT_NEWS_EXPIRATION_DAYS = 3

    exceed_date = datetime.datetime.now() - datetime.timedelta(
        days=NOT_IMPORTANT_NEWS_EXPIRATION_DAYS
    )

    await Article.delete().where(
        (Article.created_at <= exceed_date) & (Article.important == False)  # noqa: E712
    ).aio_execute()

    logger.success("All not important articles saved for more than 3 days removed")


if __name__ == "__main__":
    asyncio.run(remove_expired_articles())
    close_db()
