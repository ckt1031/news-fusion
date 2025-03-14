from pydantic import BaseModel, Field


class NewsImportanceSchema(BaseModel):
    important: bool = Field(
        ...,
        title="Important",
        description="""
        Mark as important (true) based on "Important Factors" sections.
        If content satisfies "Insignificant" sections, mark as not important (false).
        """.strip(),
    )


news_importance_prompt = """
# Task: Importance Check

You are helping people save time by determining if the content is worth reading for news, knowledge and improvement.

## Important Content

- Emergent, related, critical to global, tech, or developer news
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
{{ accept_news_criteria }}

## Insignificant Content (Mark as false if any of the following)

- Games
- Advice or tips
- Expectations but not actual releases or announcements
- Films, TV shows or music releases
- IPO price
- Tutorials like different Ways to do something:
    e.g. Google AI: 5 ways to boost productivity
- How this or that stuffs help people or companies
- Software fix and improvements
- Company dividends declared or paid
- Any advertisements, savings, sales, gifts, promotions, or discounts
- Comparisons or "best of" lists
- Racist, Sexual, LGBT or Transgender
- Quizzes
- Minor tutorials, guides or suggestions
- Minor politics, social issues or phenomena
- Minor personnel changes
{{ reject_news_criteria }}
""".strip()
