from lib.db.postgres import Article
from lib.notifications.discord_webhook import send_discord


def process_notification(article: Article, category_data: dict):
    discord_webhook: str | None = category_data["notifications"]["discord"]

    if discord_webhook is not None:
        # Send a Discord notification
        send_discord(
            webhook_url=discord_webhook,
            message=None,
            # message=f"New article in {category_data['name']}: {article.title}",
            embed={
                "title": article.title,
                "description": article.summary,
                "url": article.link,
                "image": {"url": article.image},
            },
        )
