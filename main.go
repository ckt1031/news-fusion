package main

import (
	"log"

	"github.com/ckt1031/news-fusion/lib"
	"github.com/ckt1031/news-fusion/lib/api"
	"github.com/ckt1031/news-fusion/lib/web"
	"github.com/joho/godotenv"
	"github.com/robfig/cron"
)

func main() {
	err := godotenv.Load()

	if err != nil {
		log.Println("Error loading .env file")
	}

	api.InitOpenAIClient()
	lib.InitRedisClient()

	r := web.WebServer()

	go func() {
		err = r.Run(":8198")

		if err != nil {
			log.Println("Failed to start server")
		}
	}()

	lib.Initialize()
	lib.RefreshPubSub()

	c := cron.New()
	_ = c.AddFunc("0 0 0 * * *", func() {
		lib.Initialize()
	})
	_ = c.AddFunc("0 */15 * * * *", func() {
		lib.RefreshPubSub()
	})

	c.Start()

	select {}
}
