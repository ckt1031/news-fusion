package handlers

import (
	"fmt"
	"strings"
	"time"

	goose "github.com/advancedlogic/GoOse"
	"github.com/ckt1031/news-fusion/lib"
	"github.com/ckt1031/news-fusion/lib/api"
	"github.com/openai/openai-go"
	"github.com/pkoukk/tiktoken-go"
	"golang.org/x/crypto/sha3"
)

func CheckImportance(content string) (bool, error) {
	importancePrompt := lib.GetImportancePrompt()

	completion, err := api.ChatCompletion(api.ChatCompletionParams{
		Messages: []openai.ChatCompletionMessageParamUnion{
			openai.SystemMessage(importancePrompt),
			openai.UserMessage(content),
		},
	})

	if err != nil {
		return false, err
	}

	important := strings.ToLower(completion) == "true"

	return important, nil
}

func sha3Hash(input string) string {
	// Create a new hash & write input string
	hash := sha3.New256()
	_, _ = hash.Write([]byte(input))

	// Get the resulting encoded byte slice
	sha3 := hash.Sum(nil)

	// Convert the encoded byte slice to a string
	return fmt.Sprintf("%x", sha3)
}

func GetCacheKey(url string) string {
	url = sha3Hash(url)
	return fmt.Sprintf("article:%s", url)
}

func CalculateTokens(content string) (int, error) {
	encoding := openai.EmbeddingModelTextEmbedding3Small

	tkm, err := tiktoken.EncodingForModel(encoding)

	if err != nil {
		return 0, err
	}

	// encode
	token := tkm.Encode(content, nil, nil)

	return len(token), nil
}

func HandleArticle(body lib.ArticleItemBody, notification *lib.Notification) error {
	if body.URL == "" {
		return fmt.Errorf("URL is required")
	}

	key := GetCacheKey(body.URL)

	// Check if the URL has already been processed
	if status, err := lib.GetRedisBoolKey(key); err == nil && status {
		return nil
	}

	g := goose.New()
	article, err := g.ExtractFromURL(body.URL)

	if err != nil {
		return err
	}

	content := fmt.Sprintf("Title: %s\nContent:%s", article.Title, article.CleanedText)

	tokens, err := CalculateTokens(content)

	if err != nil {
		return err
	}

	if tokens > 7500 {
		return fmt.Errorf("Content is too long")
	}

	embeddings, err := api.Embeddings(content)

	if err != nil {
		return err
	}

	if has, err := lib.QueryArticleAndCheck(embeddings); err != nil || has {
		return err
	}

	important, err := CheckImportance(content)

	if err != nil {
		return err
	}

	if !important {
		return nil
	}

	shortSummaryPrompt := lib.GetShortSummaryPrompt()

	messages := []openai.ChatCompletionMessageParamUnion{
		openai.SystemMessage(shortSummaryPrompt),
		openai.UserMessage(content),
	}

	temperature := 0.3

	completion, err := api.ChatCompletion(api.ChatCompletionParams{
		Messages:    messages,
		Temperature: &temperature,
	})

	if err != nil {
		return err
	}

	body.Description = completion

	err = HandleNotification(body, notification)

	if err == nil {
		if err := lib.SetRedisBoolKey(key, true, time.Hour*72); err != nil {
			return err
		}

		// TODO: Support multiple embeddings
		err = lib.InsertArticle(embeddings, content)
	}

	return err
}
