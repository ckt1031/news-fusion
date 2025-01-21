from redis import asyncio as aioredis

from lib.env import get_env
from lib.utils import sha1_hash

redis_url = get_env("REDIS_URL", "redis://localhost")
redis_client = aioredis.from_url(redis_url)


def get_article_redis_key(guid: str) -> str:
    return f"article_hash:{sha1_hash(guid)}"
