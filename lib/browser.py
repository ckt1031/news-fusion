import undetected_chromedriver as uc

from lib.utils import check_if_arg_exists

browser_driver: uc.Chrome = None
# Try using selenium if it has --selenium-fallback flag
browser_allowed = check_if_arg_exists("--selenium-fallback")

if browser_allowed:
    browser_driver = uc.Chrome(headless=False, use_subprocess=True)
