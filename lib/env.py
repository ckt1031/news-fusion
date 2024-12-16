import os

from dotenv import load_dotenv


def check_is_development() -> bool:
    if os.getenv("PRODUCTION") == "true":
        return False

    # Check if we have .dev.env and dev.config.yaml
    if not os.path.exists(".dev.env") or not os.path.exists("dev.config.yaml"):
        return False

    return True


IS_PRODUCTION = not check_is_development()

load_dotenv(".env" if IS_PRODUCTION else ".dev.env")

SERVER_URL = os.getenv("SERVER_URL")


def get_env(key: str, default=None) -> str:
    return os.getenv(key, default)
