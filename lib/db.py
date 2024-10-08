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

# Optional, or use default localhost
DATABASE_URL = os.getenv("DATABASE_URL")

db = PostgresqlDatabase(DATABASE_URL)

db.connect()


class BaseModel(Model):
    class Meta:
        database = db


class Article(BaseModel):
    title = CharField(unique=True)
    link = CharField(unique=True)
    summary = TextField(null=True)
    image = TextField(null=True)
    topic = CharField()
    important = BooleanField(default=False)
    published_at = DateTimeField(default=datetime.datetime.now)
    created_at = DateTimeField(default=datetime.datetime.now)


db.create_tables([Article])
