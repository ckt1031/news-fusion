import undetected_chromedriver as uc

from lib.utils import check_if_arg_exists

chrome_driver = None

if check_if_arg_exists("--selenium-fallback"):
    chrome_driver = uc.Chrome(headless=False, use_subprocess=True)
