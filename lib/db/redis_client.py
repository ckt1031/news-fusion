from redis import asyncio as aioredis

from lib.env import get_env

redis_url = get_env("REDIS_URL", "redis://localhost")
redis = aioredis.from_url(redis_url)
