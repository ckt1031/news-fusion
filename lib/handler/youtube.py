from datetime import datetime

from loguru import logger
from youtube_transcript_api import YouTubeTranscriptApi

from lib.handler.utils import similarity_check, split_text_by_token
from lib.openai_api import OpenAIAPI, count_tokens
from lib.prompts import TitleSummarySchema, summary_prompt


def get_youtube_id(link: str) -> str:
    # Possible YouTube Links:
    # https://www.youtube.com/watch?v=ID
    # https://youtu.be/ID

    if "youtube.com" in link:
        return link.split("v=")[1]
    elif "youtu.be" in link:
        return link.split("be/")[1]
    return link


def get_transcript(link: str) -> str:
    video_id = get_youtube_id(link)
    transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
    original_transcript = transcript_list.find_transcript(
        ["en", "zh", "zh-CN", "zh-TW"]
    )
    translated_transcript = original_transcript.translate("en")
    transcripts = translated_transcript.fetch()

    transcript_text = [transcript["text"] for transcript in transcripts]

    # Text list to string
    transcript_text = " ".join(transcript_text)

    if len(transcript_text) == 0:
        raise Exception(f"Failed to fetch YouTube transcript: {link}")

    return transcript_text


async def handle_youtube(
    link: str,
    title: str,
    guid: str,
    entry: dict,
    category_config: dict[str, str | bool | None],
    published_date_utc: datetime,
) -> dict | None:
    transcript = get_transcript(link)
    transcript_token = count_tokens(transcript)
    reduced_transcript = transcript

    if transcript_token > 8000:
        texts = split_text_by_token(transcript, 7500)
        logger.warning(
            f"Transcript is too long: {link} ({transcript_token} tokens), only first part will be processed"
        )
        reduced_transcript = texts[0]

    date_str = published_date_utc.strftime("%Y-%m-%d %H:%M:%S")
    content_with_meta = f"Title: {title}\nDate: {date_str}\nTranscript: {transcript}"
    content_embedding = None

    if category_config.get("similarity_check", True):
        # TODO: Support for multiple splits
        e = await similarity_check(reduced_transcript, guid, link)

        if e["similar"]:
            return None

        content_embedding = e["content_embedding"]

    # Generate title and summary
    openai_api = OpenAIAPI()
    generated_title_summary = await openai_api.generate_schema(
        user_message=content_with_meta,
        system_message=summary_prompt,
        schema=TitleSummarySchema,
    )

    # Obtain from feed
    image = entry.get("media_thumbnail", [{}])[0].get("url", None)

    return {
        "image": image,
        "embedding": content_embedding,
        "content": generated_title_summary,
    }
