import datetime

from loguru import logger

from lib.db import Article
from lib.init_logger import init_logger

expiration_days = 30

init_logger()


def remove_expired_articles():
    exceed_date = datetime.datetime.now() - datetime.timedelta(days=expiration_days)
    Article.delete().where(
        Article.created_at.day <= exceed_date.day
        and Article.created_at.month <= exceed_date.month
        and Article.created_at.year <= exceed_date.year
    ).execute()

    logger.success("Expired articles removed")


if __name__ == "__main__":
    remove_expired_articles()
