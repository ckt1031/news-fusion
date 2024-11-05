package handlers

import (
	"github.com/ckt1031/news-fusion/lib"
	notificationLib "github.com/ckt1031/news-fusion/lib/notification"
)

func HandleNotification(notification lib.NotificationBody, config lib.Notification) error {
	var err error

	if config.Discord != nil {
		err = notificationLib.DiscordWebhook(notification, config)
	}

	return err
}
