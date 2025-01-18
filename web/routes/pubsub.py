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

PUBSUB_TOKEN = get_env("PUBSUB_TOKEN")


@pubsub_router.get(
    "/pubsub/subscription",
    summary="Pubsub Callback for Subscription",
    tags=["Pubsub"],
    include_in_schema=False,
    dependencies=[Depends(RateLimiter(times=60, seconds=120))],
)
async def subscription(request: Request) -> Response:
    challenge = request.query_params.get("hub.challenge")
    verify_token = request.query_params.get("hub.verify_token")

    if verify_token != PUBSUB_TOKEN:
        logger.warning("Invalid Pubsub verify token")
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
        logger.warning("Invalid Pubsub signature format")
        return False

    signature = signature_header.replace("sha1=", "")

    body_signature = hmac.new(
        PUBSUB_TOKEN.encode("utf-8"),
        body,
        hashlib.sha1,
    )

    new_signature = binascii.hexlify(body_signature.digest()).decode("utf-8")

    return new_signature == signature


@pubsub_router.post(
    "/pubsub/subscription",
    summary="Pubsub callback for new distribution",
    tags=["Pubsub"],
    include_in_schema=False,
    dependencies=[Depends(RateLimiter(times=60, seconds=120))],
)
async def distribution(req: Request, bg: BackgroundTasks) -> Response:
    # Signature is in the format of "sha1=xxxx"
    signature = req.headers.get("X-Hub-Signature")

    if signature is None:
        logger.warning("Missing Pubsub signature")
        return PlainTextResponse(
            status_code=404,
            content="404 Not Found",
        )

    body = await req.body()
    signature_status = await verify_signature(signature, body)

    if not signature_status:
        logger.warning("Invalid Pubsub signature")
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
