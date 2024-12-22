from lib.db.postgres import Article
from lib.notifications.discord_webhook import send_discord


def process_notification(article: Article, category_data: dict):
    discord_channel_id: str = category_data["discord_channel_id"]

    send_discord(
        channel_id=discord_channel_id,
        message=None,
        embed={
            "title": article.title,
            "description": article.summary,
            "url": article.link,
            "image": {"url": article.image},
            "footer": {"text": article.publisher},
        },
    )
