import asyncio

from lib.openai_api import MessageBody, OpenAIAPI
from lib.prompts import NewsImportanceSchema, news_importance_prompt
from lib.scraper import get_html_content


async def check_importance() -> None:
    url = "https://www.wired.com/story/airdoctor-coupon-code/"

    content = get_html_content(url)

    # Use OpenAI to re-categorize the article
    openai_api = OpenAIAPI()
    res = await openai_api.generate_schema(
        message=MessageBody(
            system=news_importance_prompt,
            user=content,
        ),
        schema=NewsImportanceSchema,
    )

    print(res)


if __name__ == "__main__":
    asyncio.run(check_importance())
