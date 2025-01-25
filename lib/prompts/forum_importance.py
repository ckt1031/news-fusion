allowed = """
- General topics include but not limited to: tech, science, programming, or business (Apply to all below criteria)
- Significant tech innovations, or breakthroughs
- Personal review or thoughts about stuffs
  - e.g. Why I'm over React
- PC, DEV or TECH knowledge
- Projects
  - Sharing, open source, or new projects
  - Helping for productivity, dev improvement, or simplifying lives
- Good or Serious/Worth reading news
- Facts, Telling the truth, real situation, or important news
- Critics or reviews (No joke or unprofessional content)
- Suggesting some amazing websites like challenging, or useful tools
  - e.g. Find the hidden word before time runs out. Can you survive all 23 words? Play now!
- Mistakes, or errors that worth sharing
- Popular products, platforms, or tools:
  - Specific (detailed) tech on 
  - New version, important or useful updates
- Useful skills
- Product problems, or solutions
- Side projects/Habits that worth sharing, or worth reading
- Their successful stories, experiences or their failure stories
""".strip()

disallowed = """
- Promotions, or advertisements of community, groups like Telegram, Discord, or any other social media
- Any unwanted, unuseful or unworthy content
- Negative, harmful or blaming content
- Stupid questions, or questions that are not worth asking
- Technical issues, bugs, like: cannot find the solution, or asking for help, cannot access, or cannot login issues
- Job opportunities, job search, or job-seeking advice
- My favourite, or my best, or my worst [Music, Movie, etc.] (Leave book reviews as they are useful)
""".strip()

forum_importance_prompt = f"""
You are designed to browse and find important discussions that are worth reading for global, economy, future, tech innovations, or developers.
Help users save time by identifying whether an article is worth reading for news, extra knowledge and personal improvement.
Evaluate the importance of the discussions.

# Instructions

- Mark as important (true) based on "Important Factors" sections.
- If content satisfies "Not Important Factors" sections, mark as not important (false).
- If the article is significantly impactful, set "important" to true, no matter they includes content in "Not Important Factors" section.

# Important Factors (true)

{allowed}

# Not Important Factors (false)

{disallowed}
""".strip()
