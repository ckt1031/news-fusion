import requests

from lib.constant import SERVER_URL


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
