import sys

import undetected_chromedriver as uc
from loguru import logger

from lib.utils import check_if_arg_exists

# Remove loggers time, level
logger.remove()
logger.add(sys.stdout, format="{time}: [<level>{level}</level>] {message}")


if check_if_arg_exists("--selenium-fallback"):
    chrome_driver = uc.Chrome(headless=False, use_subprocess=True)
