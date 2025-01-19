import asyncio
import datetime
from urllib.parse import urlparse

import peewee_async
from peewee import BooleanField, CharField, DateTimeField, TextField

from lib.env import get_env

loop = asyncio.get_event_loop()

connection_url = get_env(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/news_fusion",
)

# Parse the connection URL
db_cred = urlparse(connection_url)

db = peewee_async.PooledPostgresqlDatabase(
    db_cred.path[1:],
    user=db_cred.username,
    password=db_cred.password,
    host=db_cred.hostname,
    port=db_cred.port,
)
# db.connect()


# Make on exit function to close
def close_db():
    db.close()


class BaseModel(peewee_async.AioModel):
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

# from playhouse.migrate import *
# migrator = PostgresqlMigrator(db)
#
# migrate(
#     migrator.add_column('article', 'guid', CharField(null=True)),
# )
