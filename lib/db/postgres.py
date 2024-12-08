import datetime
import os

from dotenv import load_dotenv
from peewee import (
    BooleanField,
    CharField,
    DateTimeField,
    Model,
    PostgresqlDatabase,
    TextField,
)

load_dotenv()

db = PostgresqlDatabase(os.getenv("DATABASE_URL"))
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
