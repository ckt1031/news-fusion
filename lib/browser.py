from seleniumbase import Driver

from lib.utils import check_if_arg_exists

browser_driver: Driver or None = None
# Try using selenium if it has --selenium-fallback flag
browser_allowed = check_if_arg_exists("--selenium-fallback")

if browser_allowed:
    browser_driver = Driver(
        uc=True,
        locale_code="en",
        uc_subprocess=True,
        ad_block_on=True,
        do_not_track=True,
        dark_mode=True,
    )
