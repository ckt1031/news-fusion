import datetime

from loguru import logger

from lib.db.postgres import Article
from lib.utils import init_logger

init_logger()


def remove_expired_articles():
    EXPIRATION_DAYS = 30

    exceed_date = datetime.datetime.now() - datetime.timedelta(days=EXPIRATION_DAYS)

    Article.delete().where(
        Article.created_at.day <= exceed_date.day
        and Article.created_at.month <= exceed_date.month
        and Article.created_at.year <= exceed_date.year
    ).execute()

    logger.success("Expired articles removed")


if __name__ == "__main__":
    remove_expired_articles()
