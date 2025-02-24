export PRODUCTION="true"
export LOGURU_LEVEL="INFO"

python crawl.py --check-forum --check-youtube --selenium-fallback
