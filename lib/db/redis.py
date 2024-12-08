import os

from redis import asyncio as aioredis

redis = aioredis.from_url(os.getenv("REDIS_URL", "redis://localhost"))
