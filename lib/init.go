package lib

import (
	"log"
	"net/http"
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

func ReversePrefix(feed string) string {
	if strings.HasPrefix(feed, YOUTUBE_RSS_URL) {
		return "yt://" + feed[len(YOUTUBE_RSS_URL):]
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
				continue
			}

			log.Println("Registered topic to PubSub:", feed)
		}
	}
}

func RefreshPubSub() {
	// Initialize the configuration
	config := GetConfiguration()

	for _, topic := range config.RSS {
		for _, feed := range topic.Sources {
			if strings.HasPrefix(feed, "yt://") {
				continue
			}

			// Parse the prefix
			feed = ParsePrefix(feed)

			// POSt https://pubsubhubbub.appspot.com/
			url := "https://pubsubhubbub.appspot.com/"

			req, err := http.NewRequest("POST", url, nil)

			if err != nil {
				log.Println("Failed to create request:", err)
				continue
			}

			// Content-Type: application/x-www-form-urlencoded
			req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

			// Set the form data
			q := req.URL.Query()

			q.Add("hub.mode", "publish")
			q.Add("hub.url", feed)

			req.URL.RawQuery = q.Encode()

			// Send the request
			client := &http.Client{}

			resp, err := client.Do(req)

			if err != nil {
				log.Println("Failed to send request:", err)
				continue
			}

			// Close the response body
			defer resp.Body.Close()

			log.Println("Refreshed topic to PubSub:", feed)
		}
	}
}
