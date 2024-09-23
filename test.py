from time import sleep

from scraper import check_source

list = [
    'https://9to5mac.com/2024/09/17/ipados-18-m4-ipad-pro-bricked',
    'https://arstechnica.com/?p=2050551',
    'https://apple.slashdot.org/story/24/09/17/2251254/apple-pulls-ipados-18-for-m4-ipad-pro-after-bricking-complaints?utm_source=atom1.0mainlinkanon&utm_medium=feed',
    'https://www.macrumors.com/2024/09/20/iphone-16-repair-manual'
]

for url in list:
    check_source(url)
