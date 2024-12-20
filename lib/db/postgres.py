import datetime
import sys

from loguru import logger
from peewee import (
    BooleanField,
    CharField,
    DateTimeField,
    Model,
    PostgresqlDatabase,
    TextField,
)

from lib.env import get_env

try:
    db = PostgresqlDatabase(
        get_env(
            "DATABASE_URL",
            "postgresql://postgres:postgres@localhost:5432/news_fusion",
        ),
    )
    db.connect()
except Exception as e:
    logger.error(f"Error connecting to the database: {e}")
    sys.exit(1)


class BaseModel(Model):
    class Meta:
        database = db


class Article(BaseModel):
    title = CharField(unique=True)
    link = CharField(unique=True)
    summary = TextField(null=True)
    image = TextField(null=True)
    category = TextField()
    important = BooleanField(default=False)

    # Date metadata
    created_at = DateTimeField(default=datetime.datetime.now)
    published_at = DateTimeField(default=datetime.datetime.now)


db.create_tables([Article])
