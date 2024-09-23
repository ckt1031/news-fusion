import os
from peewee import *
import datetime
from dotenv import load_dotenv

load_dotenv()

POSTGRES_CONNECTION = os.getenv("POSTGRES_CONNECTION")

if not POSTGRES_CONNECTION:
    raise Exception("POSTGRES_CONNECTION is not set")

db = PostgresqlDatabase(POSTGRES_CONNECTION)

db.connect()


class BaseModel(Model):
    class Meta:
        database = db


class Article(BaseModel):
    title = CharField(unique=True)
    summary = TextField()
    link = CharField(unique=True)
    image = CharField(null=True)
    published_at = DateTimeField(efault=datetime.datetime.now)
    created_at = DateTimeField(default=datetime.datetime.now)


db.create_tables([Article])
