from pydantic import BaseModel, Field


class TitleSummarySchema(BaseModel):
    title: str = Field(
        ...,
        title="Title",
        description="Plain text title based on the content. 10 words or less.",
    )
    summary: str = Field(
        ...,
        title="Summary",
        description="Plain text or markdown formatted summary based on the content. 150 words or less.",
    )


summary_prompt = """
# Task

- Create brief, focused summaries and title from content provided.
- Respond in {{ language }} only
- Use simple, clear language, focus on main ideas and key points, be specific for exact details
- No clickbait, additional comments, or context not in the original content

## Title

- 10 words max
- No quotation marks
- Present the title as a single line without commas or line breaks
- Do not include the name of author, website and publisher for simplicity and clarity

## Summary

- 150 words max
- Simple, clear, precise, specific, focused and straight
- No subheadings
- No conclusion, personal opinions, or additional information
- Use bullet points (-) with bolded keywords if necessary
- Use markdown (example: [Link Text](<https://www.example.com>)) with text for links
""".strip()
# - For company and investing news, include stock ticker symbols (e.g., AAPL, TSLA)

comments_summary_additional_prompt = """
## Comments Summary inside Summary

Ignore this part if there are no useful comments or no comments provided

- 100 words max
- Plain text or bullet points
- Straightforward to useful comments, feedback, and suggestions
- Leave line gap between the main summary and comments summary
- Include comments with professionalism, different perspectives
- No links or references
- No greetings or goodbyes
- No questions or answers
""".strip()
