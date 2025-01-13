import shelve

from lib.notifications.discord_webhook import ensure_local_db_dir

SHELVE_PATH = "./local-db/etag"


def get_etag(feed_url: str) -> str | None:
    ensure_local_db_dir()

    with shelve.open(SHELVE_PATH, writeback=True) as db:
        return db.get(feed_url, None)


def save_etag(feed_url: str, etag: str):
    ensure_local_db_dir()

    with shelve.open(SHELVE_PATH, writeback=True) as db:
        db[feed_url] = etag
