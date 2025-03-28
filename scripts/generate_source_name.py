import asyncio
import json
import os

from loguru import logger
from pydantic import BaseModel, Field

from lib.api.llm import LLM
from lib.rss import get_all_rss_sources
from lib.utils import init_logger

init_logger()

PATH = "./source-names.json"


def read_local_cache():
    # Read the local cache file
    if os.path.exists(PATH):
        with open(PATH, "r", encoding="utf-8") as f:
            return json.load(f)

    return {}


def write_local_cache(data):
    # Write the local cache file
    with open(PATH, "w", encoding="utf-8") as f:
        f.write(json.dumps(data, indent=4))


class SourceName(BaseModel):
    name: str = Field(..., title="The name of the source")


async def generate_source_name():
    # Read the RSS configuration file
    all_sources = get_all_rss_sources(shuffle=True)

    data: dict[str, str] = read_local_cache()

    openai_api = LLM()

    # Generate the source name
    for d in all_sources:
        source = d["url"]

        # Skip if the source is already in the cache
        if source in data:
            logger.info(f"Skipping source: {source}")
            continue

        res = await openai_api.generate_schema(
            user_message=source,
            system_message="""
            Generate the name of the URL given, it must be the name of the source.
            URL can be RSS, but dont include RSS in the name.
            theverge.com -> The Verge
            bbc.com -> BBC
            cnn.com -> CNN
            """,
            schema=SourceName,
            model="gemini-1.5-flash-8b",
        )

        # Print the source name, add it to dict {category_name: source}
        data[source] = res.name

        # Write the local cache file
        write_local_cache(data)

        logger.success(f"Source: {source}, Name: {res.name}")


if __name__ == "__main__":
    asyncio.run(generate_source_name())
