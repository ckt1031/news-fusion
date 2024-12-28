from lib.rss import parse_rss_feed

source = "https://www.youtube.com/feeds/videos.xml?channel_id=UCeUJO1H3TEXu2syfAAPjYKQ"
feed = parse_rss_feed(source)
print(feed["entries"][0])
