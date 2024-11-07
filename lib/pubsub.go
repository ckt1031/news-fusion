package lib

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
)

const PUBSUB_URL = "https://pubsubhubbub.appspot.com"

// Register local service to PubSubHubbub for 2 days valid
func RegisterPubSub(topic string) error {
	callback := os.Getenv("PUBSUB_CALLBACK") + "/api/v1/subscription"

	// Register the topic
	formData := url.Values{
		"hub.verify": {"async"},
		"hub.mode":   {"subscribe"},

		// Callback URL
		"hub.callback": {callback},
		"hub.topic":    {topic},

		// Verification token
		"hub.verify_token": {GetPubVerificationToken()},
		"hub.secret":       {GetPubVerificationToken()},

		// Invalidation
		// 2 Days = 86400 * 2 = 172800
		"hub.lease_seconds": {"172800"},
	}

	resp, err := http.PostForm(PUBSUB_URL, formData)

	if err != nil {
		return err
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusAccepted {
		return errors.New("unexpected Pubshubhubbub response status " + fmt.Sprint(resp.StatusCode))
	}

	return nil
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
		}
	}
}

func RefreshPubSub() {
	// Initialize the configuration
	config := GetConfiguration()

	for _, topic := range config.RSS {
		for _, feed := range topic.Sources {
			// Skip YouTube feeds, since they are officially using PubSubHubbub
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

			// 204 No Content
			if resp.StatusCode != http.StatusNoContent {
				log.Println("Failed to refresh topic:", feed)
			}
		}
	}
}
