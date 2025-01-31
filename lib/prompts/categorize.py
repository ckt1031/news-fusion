from pydantic import BaseModel, Field

from lib.rss import get_categories_with_description


class CategorizeSchema(BaseModel):
    category: str = Field(
        ..., title="Category", description="The single ID of the category"
    )


categories_text = "\n".join(
    [f"- {x['name']}: {x['description']}" for x in get_categories_with_description()]
)

categorize_prompt = f"""
# Task: Categorize Content

You are going to categorize a piece of content based on the following categories.
Please select the most appropriate category for the content.
Return "none" if no category is suitable.

However, there will be some cases like content came from forums like Hacker News, Lobeste, Reddit, etc.
Their content can be guidelines, tutorials, or news but not directly related to the category.
Categories like technology, world are more related to News rather than general articles.
In such cases, categorize them as "none".

## Supported Categories (ID: Description)

- none: No category assigned below or sources from forum while content is not news-related
{categories_text}
"""
