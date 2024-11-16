package notification

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/bwmarrin/discordgo"
	"github.com/ckt1031/news-fusion/lib"
)

func DiscordWebhook(item lib.ArticleItemBody, notification *lib.Notification) error {
	// Check if notification and Discord webhook are set
	if notification.Discord == nil {
		return nil
	}

	embed := discordgo.MessageEmbed{
		Title:       item.Title,
		Description: item.Description,
		URL:         item.URL,
		Footer: &discordgo.MessageEmbedFooter{
			Text: item.Source,
		},
	}

	if item.Image != nil {
		embed.Image = &discordgo.MessageEmbedImage{
			URL: *item.Image,
		}
	}

	body := discordgo.WebhookParams{
		Embeds: []*discordgo.MessageEmbed{&embed},
	}

	b, err := json.Marshal(body)

	if err != nil {
		fmt.Println(err)
		return err
	}

	// JSON
	req, err := http.NewRequest("POST", *notification.Discord, bytes.NewReader(b))

	if err != nil {
		fmt.Println(err)
		return err
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}

	resp, err := client.Do(req)

	if err != nil {
		fmt.Println(err)
	}

	defer resp.Body.Close()

	if resp.StatusCode != 204 {
		fmt.Println("Failed to send Discord webhook")
	}

	return err
}
