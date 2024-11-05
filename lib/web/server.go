package web

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func WebServer() *gin.Engine {
	r := gin.Default()

	r.GET("/health-check", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "OK",
		})
	})

	r.GET("/subscription", HandleWebSubscriptions)
	r.POST("/subscription", HandleDistribution)

	return r
}
