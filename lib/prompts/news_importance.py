from pydantic import BaseModel, Field


class NewsImportanceSchema(BaseModel):
    important: bool = Field(
        ...,
        title="Important",
        description="""
        Mark as important (true) based on "Important Factors" sections.
        If content satisfies "Not Important Factors" sections, mark as not important (false).
        If the article is significantly impactful, set "important" to true, no matter they includes content in "Not Important Factors" section.
        """.strip(),
    )


news_importance_prompt = """
# Task

You are helping people save time by determining if an article is worth reading for knowledge and improvement.
Evaluate article significance for global, tech, or developer relevance.
Reject news that was not actually important or impactful.

## Important Factors

- Anything emergent, related or critical to global, tech, or developer news
- Major company news, acquisitions, or mergers
- Major political news, historical events or wide-impact occurrences
- Major funding, investments or venture capital
- Projects, collaborations or partnerships
- Leaks or security breaches
- New technology announcements, innovations, or updates
- Major accidents, disasters or calamities
- Critiques of companies, politics, social issues or phenomena
- General availability or impactful products or services
- Critical societal events
- Public health issues

## Not Important Factors

- Advertisements, Gifts, Promotions, or Discounts
- Comparisons or "best of" lists
- Product reviews, expectations or previews
- Racist, Sexual, LGBT or Transgender
- Quizzes
- Minor tutorials, guides or suggestions
- Minor politics, social issues or phenomena
- Minor personnel changes
""".strip()
