from datetime import datetime

import chevron
from youtube_transcript_api import YouTubeTranscriptApi

from lib.openai_api import MessageBody, OpenAIAPI
from lib.prompts import TitleSummarySchema, summary_prompt
from lib.types import RSSEntity


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
    original_transcript = transcript_list.find_transcript(["en", "zh"])
    translated_transcript = original_transcript.translate("en")
    transcripts = translated_transcript.fetch()

    transcript_text = [transcript["text"] for transcript in transcripts]

    # Text list to string
    transcript_text = " ".join(transcript_text)

    if len(transcript_text) == 0:
        raise Exception(f"Failed to fetch YouTube transcript: {link}")

    return transcript_text


async def handle_youtube(
    d: RSSEntity,
    category_config: dict[str, str | bool | None],
    published_date_utc: datetime,
) -> dict | None:
    link, title = d.entry["link"], d.entry["title"]

    transcript = get_transcript(link)
    date_str = published_date_utc.strftime("%Y-%m-%d %H:%M:%S")
    news_text = f"Title: {title}\nDate: {date_str}\nTranscript: {transcript}"

    # Generate title and summary
    openai = OpenAIAPI()
    generated_title_summary = await openai.generate_schema(
        MessageBody(
            system=chevron.render(
                summary_prompt,
                {
                    "language": category_config.get("language", "English US"),
                },
            ),
            user=news_text,
        ),
        schema=TitleSummarySchema,
    )

    # Obtain from feed
    image = d.entry.get("media_thumbnail", [{}])[0].get("url", None)

    return {
        "image": image,
        # "embedding": None,
        "content": generated_title_summary,
    }
