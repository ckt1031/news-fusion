package lib

import (
	"errors"
	"os"
	"strings"

	"gopkg.in/yaml.v3"
)

const YOUTUBE_RSS_URL = "https://www.youtube.com/feeds/videos.xml?channel_id="
const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15"

func GetPubVerificationToken() string {
	return os.Getenv("PUB_VERIFICATION_TOKEN")
}

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

func GetConfiguration() Configuration {
	var config Configuration

	yamlFile, err := os.ReadFile("./data/config.yaml")
	if err != nil {
		panic(err)
	}

	err = yaml.Unmarshal(yamlFile, &config)
	if err != nil {
		panic(err)
	}

	return config
}

func FindCategoryByRSSLink(rssLink string) (Category, error) {
	rssLink = ReversePrefix(rssLink)
	config := GetConfiguration()

	for _, category := range config.RSS {
		for _, feed := range category.Sources {
			if feed == rssLink {
				return category, nil
			}
		}
	}

	return Category{}, errors.New("RSS link not found in configuration")
}
