package notification

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/bwmarrin/discordgo"
	"github.com/ckt1031/news-fusion/lib"
)

func DiscordWebhook(notification lib.NotificationBody, config lib.Notification) error {
	if config.Discord == nil {
		return nil
	}

	embed := discordgo.MessageEmbed{
		Title:       notification.Title,
		Description: notification.Description,
		URL:         notification.URL,
	}

	if notification.Image != nil {
		embed.Image = &discordgo.MessageEmbedImage{
			URL: *notification.Image,
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
	req, err := http.NewRequest("POST", *config.Discord, bytes.NewReader(b))

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
