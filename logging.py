import sys

from loguru import logger

logger.remove()
logger.add(sys.stdout, format="{time}: [<level>{level}</level>] {message}")
