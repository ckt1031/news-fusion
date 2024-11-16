package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/ckt1031/news-fusion/lib"
	"github.com/ckt1031/news-fusion/lib/api"
	"github.com/ckt1031/news-fusion/lib/tasks"
	"github.com/ckt1031/news-fusion/lib/web"
	"github.com/joho/godotenv"
	"github.com/robfig/cron"
)

func main() {
	err := godotenv.Load()

	if err != nil {
		log.Println("Error loading .env file, but continuing anyway")
	}

	api.InitOpenAIClient()
	lib.InitRedisClient()
	lib.InitQdrantClient()

	r := web.WebServer()

	go func() {
		err = r.Run(":8198")

		if err != nil {
			log.Println("Failed to start server")
		}
	}()

	go lib.Initialize()

	c := cron.New()
	_ = c.AddFunc("0 0 0 * * *", func() {
		go lib.Initialize()
	})
	_ = c.AddFunc("0 */10 * * * *", func() {
		go tasks.FetchRSSAndCheck()
	})

	c.Start()

	fmt.Println("Server started")

	sc := make(chan os.Signal, 1)

	signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM, os.Interrupt)

	<-sc

	c.Stop()
	log.Println("Server closed")
}
