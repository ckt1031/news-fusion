package handlers

import (
	"github.com/ckt1031/news-fusion/lib"
	notificationLib "github.com/ckt1031/news-fusion/lib/notification"
)

func HandleNotification(item lib.ArticleItemBody, notification *lib.Notification) error {
	var err error

	if notification.Discord != nil {
		err = notificationLib.DiscordWebhook(item, notification)
	}

	return err
}
