from lib.prompts.news_importance import NewsImportanceSchema, news_importance_prompt
from lib.prompts.title_summary import TitleSummarySchema, summary_prompt

__all__ = [
    "summary_prompt",
    "news_importance_prompt",
    "NewsImportanceSchema",
    "TitleSummarySchema",
]
