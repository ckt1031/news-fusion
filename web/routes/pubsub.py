import hashlib
import hmac
import os

from dotenv import load_dotenv
from fastapi import APIRouter, BackgroundTasks, Depends, Request
from fastapi.responses import PlainTextResponse, Response
from fastapi_limiter.depends import RateLimiter
from loguru import logger

from lib.handle_pubsub import process_pubsub_distribution

load_dotenv()

pubsub_router = APIRouter()

PUB_TOKEN = os.getenv("PUBSUB_TOKEN")


@pubsub_router.get(
    "/pubsub/subscription",
    summary="Pubsub Callback for Subscription",
    tags=["Pubsub"],
    dependencies=[Depends(RateLimiter(times=20, seconds=60))],
)
async def subscription(request: Request) -> Response:
    challenge = request.query_params.get("challenge")
    verify_token = request.query_params.get("verify_token")

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
    method, signature = signature_header.split("=", 1)

    if method != "sha1":
        logger.debug(f"Invalid Pubsub signature method: {method}")
        return False

    body_signature = hmac.new(
        PUB_TOKEN.encode("utf-8"),
        body,
        hashlib.sha1,
    ).hexdigest()

    return hmac.compare_digest(signature, body_signature)


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
        return PlainTextResponse(
            status_code=404,
            content="404 Not Found",
        )

    body = await request.body()
    signature_status = await verify_signature(signature, body)

    if not signature_status:
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
