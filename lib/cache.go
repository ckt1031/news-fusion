package lib

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()

// Redis client
var RedisClient *redis.Client

// Initialize the Redis client
func InitRedisClient() {
	REDIS_URL := os.Getenv("REDIS_URL")

	if REDIS_URL == "" {
		REDIS_URL = "localhost:6379"
	}

	RedisClient = redis.NewClient(&redis.Options{
		Addr: REDIS_URL,
	})

	pong, err := RedisClient.Ping(ctx).Result()

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Redis connected:", pong)
}

// Set a key-value pair in Redis
func SetRedisStringKey(key string, value string, exp time.Duration) error {
	err := RedisClient.Set(ctx, key, value, exp).Err()

	if err != nil {
		return err
	}

	return nil
}

func GetRedisBoolKey(key string) (bool, error) {
	val, err := RedisClient.Get(ctx, key).Result()

	if err != nil {
		return false, err
	}

	return val == "true", nil
}

func SetRedisBoolKey(key string, value bool, exp time.Duration) error {
	err := RedisClient.Set(ctx, key, value, exp).Err()

	if err != nil {
		return err
	}

	return nil
}
