import requests

from lib.env import SERVER_URL, get_env


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


def register_pubsub(topic: str):
    if SERVER_URL is None:
        return

    callback = f"{SERVER_URL}v1/pubsub/subscription"

    response = requests.post(
        "https://pubsubhubbub.appspot.com/",
        data={
            "hub.verify": "async",
            "hub.mode": "subscribe",
            "hub.callback": callback,
            "hub.topic": topic,
            "hub.verify_token": get_env("PUBSUB_TOKEN"),
            "hub.secret": get_env("PUBSUB_SECRET"),
            "hub.lease_seconds": 86400,
        },
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )

    # Accepted
    if response.status_code != 202:
        raise Exception(f"Failed to register PubSub ({topic}): {response.text}")
