package lib

import (
	"log"
	"strings"
)

func ParsePrefix(feed string) string {
	// start with http:// or https://
	if strings.HasPrefix(feed, "http://") || strings.HasPrefix(feed, "https://") {
		return feed
	}

	if strings.HasPrefix(feed, "yt://") {
		return YOUTUBE_RSS_URL + feed[5:]
	}

	return feed
}

func Initialize() {
	// Initialize the configuration
	config := GetConfiguration()

	for _, topic := range config.RSS {
		for _, feed := range topic.Sources {
			// Parse the prefix
			feed = ParsePrefix(feed)

			// Register the topic
			err := RegisterPubSub(feed)

			if err != nil {
				log.Println("Failed to register topic:", err)
			}
		}
	}
}
