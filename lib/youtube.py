from tenacity import retry, stop_after_attempt, wait_fixed
from youtube_transcript_api import YouTubeTranscriptApi

YOUTUBE_RSS_BASE_URL = "https://www.youtube.com/feeds/videos.xml?channel_id="


# Possible YouTube Links:
# https://www.youtube.com/watch?v=ID
# https://youtu.be/ID


def get_youtube_id(link: str) -> str:
    if "youtube.com" in link:
        return link.split("v=")[1]
    elif "youtu.be" in link:
        return link.split("be/")[1]
    return link


@retry(stop=stop_after_attempt(3), wait=wait_fixed(20))
def get_transcript_from_youtube_link(link: str) -> str:
    video_id = get_youtube_id(link)
    transcripts = YouTubeTranscriptApi.get_transcript(video_id)

    # Lambda get transcripts[i]['text'] for i in range(len(transcripts))
    transcript_text = [transcript["text"] for transcript in transcripts]

    # text list to string
    transcript_text = " ".join(transcript_text)

    if len(transcript_text) == 0:
        raise Exception("Failed to fetch the transcript")

    return transcript_text
