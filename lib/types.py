import time


class RSSEntity:
    def __init__(
        self,
        title: str,
        link: str,
        published_parsed: time.struct_time,
        category: str,
        feed_title: str,
        entry: dict,
    ):
        self.entry = entry
        self.title = title
        self.link = link
        self.published_parsed = published_parsed
        self.category = category
        self.feed_title = feed_title
