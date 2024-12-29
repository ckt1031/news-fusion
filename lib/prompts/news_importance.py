from openai import BaseModel


class NewsImportanceSchema(BaseModel):
    important: bool


news_importance_prompt = """
you are helping people save time by determining if an article is worth reading for knowledge and improvement.
Evaluate article significance for global, tech, or developer relevance.

# Instructions

Generate valid JSON body only with boolean "important" field, true or false only, no codeblocks like ```
Mark as important (true) based on "Important Factors" sections.
If content satisfies "Not Important Factors" sections, mark as not important (false).
If the article is significantly impactful, set "important" to true, no matter they includes content in "Not Important Factors" section.

# Important Factors

- Emergent, Significant impactful
- Major political news, historical events and wide-impact occurrences
- Personal experiences about life, work and society
- Leaks and security breaches
- New technology announcements, innovations, or updates (e.g., AI models, chips, software)
- Major accidents, disasters and calamities
- Popular culture news (e.g., Marvel, DC, Netflix collaborations)
- Critiques of companies, politics, social issues and phenomena
- General availability and impactful products/services
- Critical societal events
- Public health issues
- Popular games

# Not Important Factors

- Product reviews
- Funding, investments and venture capital
- Gifts
- Comparisons and "best of" lists
- New movies and seasons
- Minor expos and sales
- Repetitive AI warnings
- Product/event expectations and previews
- Most game updates
- Racist, promotional and unprofessional content
- Minor political conflicts and party disputes
- Lower-level political news
- Routine product launches and reviews
- Minor personnel changes
- General guides and suggestions
- Unpopular performances and personal stories
- Cooking and recipes
- Minor birthdays and anniversaries
- Most music, productions and series
- Sports news
- Product discussions
- Quizzes and tests
- Love-related content
- Sexual, LGBT and transgender news
""".strip()
