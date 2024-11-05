package lib

import (
	"errors"
	"net/http"
	"net/url"
	"os"
)

const PUBSUB_URL = "https://pubsubhubbub.appspot.com"

// Register local service to PubSubHubbub for 2 days valid
func RegisterPubSub(topic string) error {
	callback := os.Getenv("PUBSUB_CALLBACK") + "/subscription"

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
		return errors.New("Failed to register topic")
	}

	return nil
}
