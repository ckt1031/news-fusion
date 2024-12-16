import requests
from loguru import logger

from lib.env import SERVER_URL, get_env
from lib.rss import get_rss_config


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
    )

    # Accepted
    if response.status_code != 202:
        action = "register" if not revoke else "revoke"
        raise Exception(f"Failed to {action} PubSub ({topic}): {response.text}")

    action = "Registered" if not revoke else "Revoked"
    logger.debug(f"{action} PubSub for {topic}")


async def register_all_topics(revoke=False):
    all_categories_with_sources = get_rss_config()

    for _, data in all_categories_with_sources.items():
        sources = data["sources"]

        for source in sources:
            await register_pubsub(source, revoke)
