from pydantic import BaseModel


class ContentMetaExtraction(BaseModel):
    article_urls: list[str]


extract_content_meta_prompt = """
Extract content meta from a list of article URLs.

The article URLs should be a list of strings, and it must be article URLs, not any other type of URL (e.g. image, video, embed, etc.).

Leave the list empty if there are no article URLs to extract.
"""
