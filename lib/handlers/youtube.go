package handlers

import (
	"github.com/ckt1031/news-fusion/lib"
	"github.com/ckt1031/news-fusion/lib/api"
	"github.com/openai/openai-go"
)

func HandleYouTubeVideo(body lib.ArticleItemBody, notification *lib.Notification) error {
	transcript, err := api.GetYouTubeVideoTranscript(body.URL)

	if err != nil {
		return err
	}

	prompt := lib.GetShortSummaryPrompt()

	messages := []openai.ChatCompletionMessageParamUnion{
		openai.SystemMessage(prompt),
		openai.UserMessage(transcript),
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

	return err
}
