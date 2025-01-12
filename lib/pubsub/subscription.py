import requests
from loguru import logger

from lib.env import SERVER_URL, get_env
from lib.rss import get_all_rss_sources


def send_pubsubhubbub_update(category: str):
    if SERVER_URL is None:
        return

    requests.post(
        "https://pubsubhubbub.appspot.com/",
        data={
            "hub.mode": "publish",
            "hub.url": f"{SERVER_URL}v1/feed/{category}",
        },
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )


async def register_pubsub(topic: str, revoke=False):
    if SERVER_URL is None:
        return

    callback = f"{SERVER_URL}v1/pubsub/subscription"

    response = requests.post(
        "https://pubsubhubbub.appspot.com/",
        data={
            "hub.verify": "async",
            "hub.mode": "subscribe" if not revoke else "unsubscribe",
            "hub.callback": callback,
            "hub.topic": topic,
            "hub.verify_token": get_env("PUBSUB_TOKEN"),
            "hub.secret": get_env("PUBSUB_TOKEN"),
            "hub.lease_seconds": 86400 if not revoke else None,
        },
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout=5,
    )

    action = "register" if not revoke else "revoke"

    # Accepted
    if response.status_code != 202:
        raise Exception(f"{action} PubSub ({topic}) failed: {response.text}")

    logger.debug(f"{action} PubSub for {topic}")


async def register_all_topics(revoke=False):
    sources = get_all_rss_sources()

    for d in sources:
        source = d[1]
        await register_pubsub(source, revoke)
