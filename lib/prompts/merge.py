"""
Merge of multiple prompts to decrease token usage.
"""

from lib.prompts.importance import NewsImportanceSchema, importance_prompt
from lib.prompts.summary import TitleSummarySchema, summary_prompt


class ImportanceSummaryMergedSchema(NewsImportanceSchema, TitleSummarySchema):
    pass


importance_summary_merged_prompt = f"{importance_prompt}\n\n{summary_prompt}"
