import asyncio

from lib.openai_api import OpenAIAPI
from lib.prompts import NewsImportanceSchema, news_importance_prompt
from lib.scraper import get_html_content


async def check_importance() -> None:
    url = "https://www.wired.com/story/airdoctor-coupon-code/"

    content = get_html_content(url)

    # Use OpenAI to re-categorize the article
    openai_api = OpenAIAPI()
    res = await openai_api.generate_schema(
        user_message=content,
        system_message=news_importance_prompt,
        schema=NewsImportanceSchema,
    )

    print(res)


if __name__ == "__main__":
    asyncio.run(check_importance())
