package main

import (
	"log"

	"github.com/ckt1031/news-fusion/lib"
	"github.com/ckt1031/news-fusion/lib/api"
	"github.com/ckt1031/news-fusion/lib/web"
	"github.com/joho/godotenv"
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
		r.Run(":8198")
	}()

	lib.Initialize()

	select {}
}
