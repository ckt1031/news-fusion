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

## Supported Categories (ID: Description)

- none: No category below is suitable
{categories_text}
"""
