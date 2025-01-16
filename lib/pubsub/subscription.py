import httpx
from loguru import logger

from lib.env import SERVER_URL, get_env
from lib.rss import get_all_rss_sources

PUBSUB_URL = "https://pubsubhubbub.appspot.com/"
PUBSUB_HEADERS = {
    "Content-Type": "application/x-www-form-urlencoded",
}


async def send_pubsubhubbub_update(category: str):
    if SERVER_URL is None:
        return

    async with httpx.AsyncClient() as client:
        await client.post(
            PUBSUB_URL,
            data={
                "hub.mode": "publish",
                "hub.url": f"{SERVER_URL}v1/feed/{category}",
            },
            headers=PUBSUB_HEADERS,
            timeout=5,
        )


async def register_pubsub(topic: str, revoke=False):
    if SERVER_URL is None:
        return

    callback = f"{SERVER_URL}v1/pubsub/subscription"

    async with httpx.AsyncClient() as client:
        response = await client.post(
            PUBSUB_URL,
            data={
                "hub.verify": "async",
                "hub.mode": "subscribe" if not revoke else "unsubscribe",
                "hub.callback": callback,
                "hub.topic": topic,
                "hub.verify_token": get_env("PUBSUB_TOKEN"),
                "hub.secret": get_env("PUBSUB_TOKEN"),
                "hub.lease_seconds": 86400 if not revoke else None,
            },
            headers=PUBSUB_HEADERS,
            timeout=5,
        )

    action = "Register" if not revoke else "Revoke"

    # Accepted
    if response.status_code != 202:
        raise Exception(f"{action} PubSub ({topic}) failed: {response.text}")

    logger.debug(f"{action} PubSub for {topic}")


async def register_all_topics(revoke=False):
    sources = get_all_rss_sources()

    for d in sources:
        source = d[1]
        await register_pubsub(source, revoke)
