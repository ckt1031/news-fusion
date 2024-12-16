import os

from dotenv import load_dotenv

load_dotenv()

SERVER_URL = os.getenv("SERVER_URL")


def get_env(key: str, default=None) -> str:
    return os.getenv(key, default)
