import os

from dotenv import load_dotenv

IS_PRODUCTION = os.getenv("PRODUCTION") == "true"

load_dotenv(".env" if IS_PRODUCTION else ".dev.env")

SERVER_URL = os.getenv("SERVER_URL")


def get_env(key: str, default=None) -> str:
    return os.getenv(key, default)
