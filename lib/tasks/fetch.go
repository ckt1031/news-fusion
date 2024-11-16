package tasks

import (
	"fmt"
	"strings"

	"github.com/ckt1031/news-fusion/lib"
	"github.com/ckt1031/news-fusion/lib/handlers"
	"github.com/mmcdole/gofeed"
)

func HandleItem(source string, feed *gofeed.Feed, item *gofeed.Item) {
	var image *string

	if item.Image != nil && item.Image.URL != "" {
		image = &item.Image.URL
	}

	body := lib.ArticleItemBody{
		Title:       item.Title,
		URL:         item.Link,
		Description: item.Description,
		Image:       image,
		Source:      feed.Title,
	}

	category, err := lib.FindCategoryByRSSLink(source)

	if err != nil {
		fmt.Println("Failed to find category by RSS link:", err)
	}

	err = handlers.HandleArticle(body, category.Notification)

	if err != nil {
		fmt.Println("Failed to handle notification:", err)
	}
}

func FetchRSSAndCheck() {
	allSources := lib.GetAllRSSLinks()

	for _, source := range allSources {
		// Filter Off yt:// prefix

		if strings.HasPrefix(source, "yt://") {
			continue
		}

		// Fetch RSS feed
		feed := lib.ParseRSSFromURL(source)

		for _, item := range feed.Items {
			go HandleItem(source, feed, item)
		}
	}
}
