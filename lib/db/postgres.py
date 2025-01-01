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

# from playhouse.migrate import *


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
    guid = CharField(null=True)
    title = CharField(unique=True)
    link = CharField(unique=True)
    summary = TextField(null=True)
    image = TextField(null=True)
    category = TextField()
    important = BooleanField(default=False)
    publisher = TextField(null=True)

    # Date metadata
    created_at = DateTimeField(default=datetime.datetime.now)
    published_at = DateTimeField(default=datetime.datetime.now)


db.create_tables([Article])

# migrator = PostgresqlMigrator(db)
#
# migrate(
#     migrator.add_column('article', 'guid', CharField(null=True)),
# )
