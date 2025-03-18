"""
This merges with news importance checks and title-summary generation.
Significantly saves time and token usage.
Some articles might be very long and require a lot of tokens to summarize.
"""

from pydantic import BaseModel, Field

from lib.prompts import news_importance_prompt, summary_prompt


class ImportanceMergedSchema(BaseModel):
    important: bool = Field(
        ...,
        title="Important",
        description="""
        Mark as important (true) based on "Important" sections.
        If content satisfies "Insignificant" sections, mark as not important (false).
        """.strip(),
    )
    title: str = Field(
        ...,
        title="Title",
        description="""
        Plain text title based on the content.
        10 words or less.
        Empty this if important is false.
        """,
    )
    summary: str = Field(
        ...,
        title="Summary",
        description="""
        Plain text or markdown formatted summary based on the content.
        150~200 words or less.
        Empty this if important is false.
        """.strip(),
    )


news_importance_summary_merged_prompt = f"{news_importance_prompt}\n\n{summary_prompt}"
