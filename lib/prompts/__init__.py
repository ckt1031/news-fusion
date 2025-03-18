from lib.prompts.categorize import CategorizeSchema, categorize_prompt
from lib.prompts.extract_meta import ContentMetaExtraction, extract_content_meta_prompt
from lib.prompts.importance import NewsImportanceSchema, importance_prompt
from lib.prompts.merge import (
    ImportanceSummaryMergedSchema,
    importance_summary_merged_prompt,
)
from lib.prompts.summary import (
    TitleSummarySchema,
    comments_summary_additional_prompt,
    summary_prompt,
)

__all__ = [
    # Prompts in string format
    "summary_prompt",
    "importance_prompt",
    "importance_summary_merged_prompt",
    "extract_content_meta_prompt",
    "categorize_prompt",
    "comments_summary_additional_prompt",
    # Schema
    "NewsImportanceSchema",
    "TitleSummarySchema",
    "ContentMetaExtraction",
    "ImportanceSummaryMergedSchema",
    "CategorizeSchema",
]
