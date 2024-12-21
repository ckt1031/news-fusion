import os
import shelve
from datetime import datetime, timedelta
from time import sleep

import requests
from loguru import logger

SHELVE_PATH = "./tmp/discord"


def ensure_tmp_dir():
    if not os.path.exists("./tmp"):
        os.makedirs("./tmp")


def get_cooldown_status():
    ensure_tmp_dir()

    with shelve.open(SHELVE_PATH) as db:
        expiry = db.get("remaining_expiry", datetime.now().isoformat())
        expiry = datetime.fromisoformat(expiry)

        data = {
            "cooldown_required": db.get("cooldown_required", False),
            "remaining_expiry": expiry,
        }

    return data


def set_cooldown_status(cooldown_required: bool, remaining_expiry: datetime):
    with shelve.open(SHELVE_PATH) as db:
        db["cooldown_required"] = cooldown_required
        db["remaining_expiry"] = remaining_expiry.isoformat()


def send_discord(webhook_url: str, message: str | None, embed: dict | None):
    cooldown_status = get_cooldown_status()

    if (
        cooldown_status["cooldown_required"]
        and cooldown_status["remaining_expiry"] > datetime.now()
    ):
        seconds_left = (
            cooldown_status["remaining_expiry"] - datetime.now()
        ).total_seconds()

        logger.debug(
            f"Discord webhook rate limit reached, sleeping for {seconds_left}s"
        )

        sleep(seconds_left)

        set_cooldown_status(False, datetime.now())

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

    remaining = int(remaining)

    if remaining == 1:
        expiry = datetime.now() + timedelta(seconds=float(reset_after))

        set_cooldown_status(True, expiry)
