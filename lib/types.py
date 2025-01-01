class RSSEntity:
    def __init__(
        self,
        feed_title: str,
        category: str,
        entry: dict,
    ):
        self.feed_title = feed_title
        self.entry = entry
        self.category = category
