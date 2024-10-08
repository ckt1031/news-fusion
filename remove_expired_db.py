import datetime
from logging import logger

from pg import Article

expiration_days = 30


def remove_expired_articles():
    Article.delete().where(
        Article.created_at
        < (datetime.datetime.now() - datetime.timedelta(days=expiration_days))
    ).execute()

    logger.success("Expired articles removed")


if __name__ == "__main__":
    remove_expired_articles()
