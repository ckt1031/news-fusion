package lib

import (
	"github.com/mmcdole/gofeed"
)

// Returns a parsed RSS feed from the given URL
func ParseRSSFromURL(url string) *gofeed.Feed {
	fp := gofeed.NewParser()
	feed, _ := fp.ParseURL(url)
	return feed
}

func ParseRSSFromString(content string) *gofeed.Feed {
	fp := gofeed.NewParser()
	feed, _ := fp.ParseString(content)
	return feed
}
