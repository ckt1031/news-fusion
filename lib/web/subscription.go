package web

import (
	"fmt"
	"net/http"

	"github.com/ckt1031/news-fusion/lib"
	"github.com/gin-gonic/gin"
)

// WebSub will return a testing request.
// We must respond with a 200 status code to enable future notifications
func HandleWebSubscriptions(c *gin.Context) {
	topic := c.Query("hub.topic")
	hubChallenge := c.Query("hub.challenge")
	hubVerifyToken := c.Query("hub.verify_token")

	// Return hub.challenge if hub.verify_token is correct
	if hubVerifyToken != lib.GetPubVerificationToken() {
		// Must return 404 for invalid hub.verify_token
		c.String(http.StatusNotFound, "404 Not Found")

		fmt.Println("Invalid hub.verify_token")

		return
	}

	// Body with hub.challenge
	c.String(http.StatusOK, hubChallenge)

	fmt.Println("Subscription verified for topic: ", topic)
}
