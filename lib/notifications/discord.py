import asyncio
from datetime import datetime, timedelta

import httpx
from loguru import logger

from lib.db.redis_client import redis_client
from lib.env import get_env

REDIS_KEY = "discord_rate_limit"


async def get_cooldown_status():
    retrieved_data = redis_client.hmget(REDIS_KEY)

    iso = retrieved_data.get("remaining_expiry", datetime.now().isoformat())

    return {
        "cooldown_required": retrieved_data.get("cooldown_required", False),
        "remaining_expiry": retrieved_data.get("remaining_expiry", iso),
    }


async def set_cooldown_status(cooldown_required: bool, remaining_expiry: datetime):
    await redis_client.hmset(
        REDIS_KEY,
        {
            "cooldown_required": cooldown_required,
            "remaining_expiry": remaining_expiry.isoformat(),
        },
    )


async def send_discord(
    channel_id: str, message: str | None = None, embed: dict | None = None
):
    cooldown_status = await get_cooldown_status()

    if (
        cooldown_status["cooldown_required"]
        and cooldown_status["remaining_expiry"] > datetime.now()
    ):
        expiry: datetime = cooldown_status["remaining_expiry"]

        seconds_left = (expiry - datetime.now()).total_seconds()

        logger.warning(f"Discord rate limit reached, sleeping for {seconds_left}s")

        await asyncio.sleep(seconds_left)
        await set_cooldown_status(False, datetime.now())

    data = {"content": message}

    if embed is not None:
        data["embeds"] = [embed]

    # Send Discord Message to channel
    url = f"https://discord.com/api/v10/channels/{channel_id}/messages"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bot {get_env('DISCORD_BOT_TOKEN')}",
    }

    # Send the message to the Discord webhook
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=data, headers=headers)

    if response.status_code >= 300:
        raise ValueError(
            f"Discord POST message ({response.status_code}): {response.text}"
        )

    # Check X-RateLimit-Limit and X-RateLimit-Remaining headers
    remaining = response.headers.get("X-RateLimit-Remaining")
    reset_after = response.headers.get("X-RateLimit-Reset-After")

    if remaining is None or reset_after is None:
        return

    if int(remaining) == 1:
        expiry = datetime.now() + timedelta(seconds=float(reset_after))

        # Set the cooldown status to local db
        await set_cooldown_status(True, expiry)
