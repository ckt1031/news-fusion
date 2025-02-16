import os

from dotenv import dotenv_values


def is_dev_mode() -> bool:
    # By default, we are in development mode
    if os.getenv("PRODUCTION") == "true":
        return False

    # Check if we have .dev.env and dev.config.yaml
    if not os.path.exists(".dev.env") or not os.path.exists("dev.config.yaml"):
        return False

    return True


def get_env(key: str, default=None) -> str:
    env_file = ".dev.env" if is_dev_mode() else ".env"

    if not os.path.exists(env_file):
        return os.getenv(key, default)

    config = dotenv_values(env_file)

    return config.get(key, default)
