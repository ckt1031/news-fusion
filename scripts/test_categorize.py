import asyncio

from lib.openai_api import MessageBody, OpenAIAPI
from lib.prompts.categorize import CategorizeSchema, categorize_prompt


async def re_categorize() -> None:
    title = "Diseased Chicken Entered UK Due To Brexit Delays"
    summary = """
    A Bureau of Investigative Journalism investigation reveals that post-Brexit delays in UK border checks allowed diseased meat, particularly salmonella-contaminated Polish chicken, to enter the country.  Internal government documents from late 2023 show officials admitting a lack of border controls, exposing consumers to risk.  The issue led to a spike in salmonella infections, reaching record highs in 2024. While some checks were implemented in 2024, concerns remain about insufficient funding and staffing for thorough inspections, potentially leaving consumers vulnerable to foodborne illnesses.  The Food Standards Agency (FSA) has been working with Polish authorities to improve safety measures, and the UK government maintains its commitment to biosecurity.
    """
    user_prompt = f"Original Category: Hacker News\nTitle: {title}\nSummary: {summary}"

    # Use OpenAI to re-categorize the article
    openai_api = OpenAIAPI()
    res = await openai_api.generate_schema(
        message=MessageBody(
            system=categorize_prompt,
            user=user_prompt,
        ),
        schema=CategorizeSchema,
    )

    print(res.category)


if __name__ == "__main__":
    asyncio.run(re_categorize())
