import binascii
import hashlib
import hmac

from fastapi import APIRouter, BackgroundTasks, Depends, Request
from fastapi.responses import PlainTextResponse, Response
from fastapi_limiter.depends import RateLimiter
from loguru import logger

from lib.env import get_env
from lib.pubsub.distribution import process_pubsub_distribution

pubsub_router = APIRouter()

PUB_TOKEN = get_env("PUBSUB_TOKEN")


@pubsub_router.get(
    "/pubsub/subscription",
    summary="Pubsub Callback for Subscription",
    tags=["Pubsub"],
    dependencies=[Depends(RateLimiter(times=20, seconds=60))],
)
async def subscription(request: Request) -> Response:
    challenge = request.query_params.get("hub.challenge")
    verify_token = request.query_params.get("hub.verify_token")

    if verify_token != PUB_TOKEN:
        logger.debug(f"Invalid Pubsub verify token: {verify_token}")
        return PlainTextResponse(
            status_code=404,
            content="404 Not Found",
        )

    return PlainTextResponse(
        status_code=200,
        content=challenge,
    )


async def verify_signature(signature_header: str, body: bytes) -> bool:
    if not signature_header.startswith("sha1="):
        return False

    signature = signature_header.split("=")[1]

    body_signature = hmac.new(
        PUB_TOKEN.encode("utf-8"),
        body,
        hashlib.sha1,
    )
    new_signature = binascii.hexlify(body_signature.digest()).decode("utf-8")

    return new_signature == signature


@pubsub_router.post(
    "/pubsub/subscription",
    summary="Pubsub callback for new distribution",
    tags=["Pubsub"],
    dependencies=[Depends(RateLimiter(times=20, seconds=60))],
)
async def distribution(request: Request, bg: BackgroundTasks) -> Response:
    # Signature is in the format of "sha1=xxxx"
    signature = request.headers.get("X-Hub-Signature")

    if signature is None:
        logger.debug("Missing Pubsub signature")
        return PlainTextResponse(
            status_code=404,
            content="404 Not Found",
        )

    body = await request.body()
    signature_status = await verify_signature(signature, body)

    if not signature_status:
        logger.debug("Invalid Pubsub signature")
        return PlainTextResponse(
            status_code=404,
            content="404 Not Found",
        )

    # Process the distribution in the background
    bg.add_task(process_pubsub_distribution, body)

    return PlainTextResponse(
        status_code=200,
        content="OK",
    )
