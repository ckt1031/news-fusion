import datetime

from peewee import (
    BooleanField,
    CharField,
    DateTimeField,
    Model,
    PostgresqlDatabase,
    TextField,
)

from lib.env import get_env

db = PostgresqlDatabase(
    get_env(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/news_fusion",
    ),
)
db.connect()


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
