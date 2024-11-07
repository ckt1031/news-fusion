package web

import (
	"net/http"
	"time"

	ratelimit "github.com/JGLTechnologies/gin-rate-limit"
	"github.com/ckt1031/news-fusion/lib"
	"github.com/gin-gonic/gin"
)

func keyFunc(c *gin.Context) string {
	return c.ClientIP()
}

func errorHandler(c *gin.Context, info ratelimit.Info) {
	c.String(429, "Too many requests")
}

func WebServer() *gin.Engine {
	r := gin.Default()

	store := ratelimit.RedisStore(&ratelimit.RedisOptions{
		RedisClient: lib.RedisClient,
		Rate:        time.Second * 60,
		Limit:       150,
	})

	mw := ratelimit.RateLimiter(store, &ratelimit.Options{
		ErrorHandler: errorHandler,
		KeyFunc:      keyFunc,
	})

	r.Use(mw)

	r.GET("/health-check", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "OK",
		})
	})

	v1 := r.Group("/api/v1")
	{
		v1.GET("/subscription", HandleWebSubscriptions)
		v1.POST("/subscription", HandleDistribution)
	}

	return r
}
