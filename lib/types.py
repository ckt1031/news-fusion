class RSSEntity:
    def __init__(
        self,
        feed_title: str,
        category: str,
        entry: dict,
        feed_url: str,
    ):
        self.feed_url = feed_url
        self.feed_title = feed_title
        self.entry = entry
        self.category = category
