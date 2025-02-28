important_factors = """
- Anything significant and impactful in general
- Significant tech innovations or breakthroughs
- Personal review or thoughts about stuffs
- Life, World, Technology or Programming knowledge
- Projects
  - Sharing, open source or new projects
  - Helping for productivity, dev improvement or simplifying lives
- Good or Serious/Worth reading news
- Facts, Telling the truth, real situation or important news
- Critics or reviews (No joke or unprofessional content)
- Suggesting some amazing websites like challenging or useful tools
  - e.g. Find the hidden word before time runs out. Can you survive all 23 words? Play now!
- Mistakes,or errors that worth sharing
- Popular products, platforms or tools:
  - Specific (detailed) tech on 
  - New version, important or useful updates
- Useful skills
- Product problems or solutions
- Side projects or Habits that worth sharing or worth reading
- Their successful stories, experiences or their failure stories
""".strip()

insignificant_factors = """
- Promotions, advertisements of community, groups like Telegram, Discord or any other social media
- Unwanted, unuseful or unworthy content
- Negative, harmful or blaming content
- Stupid questions or questions that are not worth asking
- Technical issues, bugs
  - Example: cannot find solution, help needed, registration or login problems
""".strip()

forum_importance_prompt = f"""
# Task

You are going to find important discussions that are worth reading for global, economy, future, tech innovations, or developers.
Help users save time by identifying whether an article is worth reading for news, extra knowledge and improvement.

## Important Factors

{important_factors}

## Insignificant Factors

{insignificant_factors}
""".strip()
