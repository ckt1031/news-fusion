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
from peewee_migrate import Router

load_dotenv()

POSTGRES_CONNECTION = os.getenv("POSTGRES_CONNECTION")

if not POSTGRES_CONNECTION:
    raise Exception("POSTGRES_CONNECTION is not set")

db = PostgresqlDatabase(POSTGRES_CONNECTION)

db_router = Router(db)

db.connect()


class BaseModel(Model):
    class Meta:
        database = db


class Article(BaseModel):
    title = CharField(unique=True)
    link = CharField(unique=True)
    summary = TextField(null=True)
    image = CharField(null=True)
    topic = CharField()
    important = BooleanField(default=False)
    published_at = DateTimeField(default=datetime.datetime.now)
    created_at = DateTimeField(default=datetime.datetime.now)


db.create_tables([Article])
