package api

import (
	"context"
	"os"

	"github.com/openai/openai-go" // imported as openai
	"github.com/openai/openai-go/option"
)

// OpenAI API client
var OpenAIClient *openai.Client

// Initialize the OpenAI API client
func InitOpenAIClient() {
	API_KEY := os.Getenv("OPENAI_API_KEY")
	API_BASE_URL := os.Getenv("OPENAI_API_BASE_URL")

	if API_BASE_URL == "" {
		API_BASE_URL = "https://api.openai.com/v1"
	}

	OpenAIClient = openai.NewClient(
		option.WithAPIKey(API_KEY),
		option.WithBaseURL(API_BASE_URL),
	)
}

type ChatCompletionParams struct {
	Model       *string  // default "gpt-4o-mini"
	Temperature *float64 // default 0.5
	Messages    []openai.ChatCompletionMessageParamUnion
}

func ChatCompletion(params ChatCompletionParams) (string, error) {
	model := openai.ChatModelGPT4oMini
	temperature := 0.5

	if params.Temperature != nil {
		temperature = *params.Temperature
	}

	if params.Model != nil {
		model = *params.Model
	}

	resp, err := OpenAIClient.Chat.Completions.New(context.TODO(), openai.ChatCompletionNewParams{
		Model:       openai.F(model),
		Temperature: openai.F(temperature),
		Messages:    openai.F(params.Messages),
	})

	if err != nil {
		return "", err
	}

	return resp.Choices[0].Message.Content, nil
}
