package web

import (
	"crypto/hmac"
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"io"
	"strings"

	"github.com/ckt1031/news-fusion/lib"
	"github.com/ckt1031/news-fusion/lib/handlers"
	"github.com/gin-gonic/gin"
)

// Verify the signature of the request, with SHA1 HMAC.
// Reference: https://pubsubhubbub.github.io/PubSubHubbub/pubsubhubbub-core-0.4.html#authednotify
func verifySignature(signature string, body string) bool {
	if signature == "" {
		return false
	}

	// Signature is in the format of "sha1=xxxx"
	method, sig := signature[:5], signature[5:]

	if method != "sha1=" {
		fmt.Println("Invalid signature method")
		return false
	}

	secret := lib.GetPubVerificationToken()

	mac := hmac.New(sha1.New, []byte(secret))
	mac.Write([]byte(body))

	expectedSignature := hex.EncodeToString(mac.Sum(nil))

	return sig == expectedSignature
}

// Handle a POST request from the WebSub server
func HandleDistribution(c *gin.Context) {
	signature := c.GetHeader("X-Hub-Signature")

	bodyBytes, err := io.ReadAll(c.Request.Body)

	if err != nil {
		c.String(500, "Internal Server Error")
		fmt.Println("Failed to read request body")
		return
	}

	xmlString := string(bodyBytes)

	if !verifySignature(signature, xmlString) {
		c.String(200, "Bad Request")
		fmt.Println("Failed to verify signature")
		return
	}

	c.String(200, "OK")

	feed := lib.ParseRSSFromString(xmlString)

	if feed == nil {
		fmt.Println("Failed to parse RSS feed")
		return
	}

	item := feed.Items[0]

	fmt.Printf("Received new article: %s (%s)\n", item.Title, feed.Title)

	category, err := lib.FindCategoryByRSSLink(feed.FeedLink)

	if err != nil {
		fmt.Println("Failed to find category:\n", err, feed.Title, feed.FeedLink)
		return
	}

	var image *string

	if item.Image != nil && item.Image.URL != "" {
		image = &item.Image.URL
	}

	body := lib.ArticleItemBody{
		Title:       item.Title,
		URL:         item.Link,
		Description: item.Description,
		Image:       image,
	}

	if strings.HasPrefix(feed.Link, lib.YOUTUBE_RSS_URL) {
		err = handlers.HandleYouTubeVideo(body, category.Notification)
	} else {
		err = handlers.HandleArticle(body, category.Notification)
	}

	if err != nil {
		fmt.Println("Failed to handle notification:", err)
	}
}
