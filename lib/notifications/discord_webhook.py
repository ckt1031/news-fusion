from datetime import datetime, timedelta
from time import sleep

import requests
from loguru import logger

COOLDOWN_REQUIRED = False
REMAINING_EXPIRY = datetime.now()


def send_discord(webhook_url: str, message: str | None, embed: dict | None):
    global COOLDOWN_REQUIRED, REMAINING_EXPIRY

    if COOLDOWN_REQUIRED and REMAINING_EXPIRY > datetime.now():
        seconds_left = (REMAINING_EXPIRY - datetime.now()).total_seconds()

        logger.debug(
            f"Discord webhook rate limit reached, sleeping for {seconds_left}s"
        )

        sleep(seconds_left)

        COOLDOWN_REQUIRED = False

    data = {"content": message}

    if embed is not None:
        data["embeds"] = [embed]

    # Send the message to the Discord webhook
    response = requests.post(webhook_url, json=data)

    if response.status_code != 204:
        raise ValueError(f"Discord webhook returned status code {response.status_code}")

    # Check X-RateLimit-Limit and X-RateLimit-Remaining headers
    remaining = response.headers.get("X-RateLimit-Remaining")
    reset_after = response.headers.get("X-RateLimit-Reset-After")

    if remaining is None or reset_after is None:
        return

    REMAINING = int(remaining)

    if REMAINING == 1:
        COOLDOWN_REQUIRED = True
        REMAINING_EXPIRY = datetime.now() + timedelta(seconds=float(reset_after))
