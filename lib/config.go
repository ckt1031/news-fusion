package lib

import (
	"errors"
	"os"

	"gopkg.in/yaml.v3"
)

const YOUTUBE_RSS_URL = "https://www.youtube.com/feeds/videos.xml?channel_id="
const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15"

func GetPubVerificationToken() string {
	return os.Getenv("PUB_VERIFICATION_TOKEN")
}

func GetConfiguration() Configuration {
	var config Configuration

	yamlFile, err := os.ReadFile("./config.yaml")
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
