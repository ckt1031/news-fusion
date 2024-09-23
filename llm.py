import os

import openai
from dotenv import load_dotenv

load_dotenv()


def get_embedding_model():
    embedding_model = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")

    return embedding_model


def get_text_completion_model():
    text_completion_model = os.getenv("TEXT_MODEL", "gpt-4o-mini")

    return text_completion_model


class Messages:
    system: str | None
    user: str


class LLM:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")

        if not self.api_key:
            raise Exception("OPENAI_API_KEY is not set")

        self.api_base_url = os.getenv(
            "OPENAI_API_BASE_URL", "https://api.openai.com/v1"
        )
        self.client = openai.Client(
            api_key=self.api_key,
            base_url=self.api_base_url,
        )

    def embed(self, text: str):
        response = self.client.embeddings.create(
            model=get_embedding_model(),
            input=text,
        )
        return response

    def generate_text(self, message: Messages) -> str:
        response = self.client.chat.completions.create(
            model=get_text_completion_model(),
            messages=[
                # Only include system messages if they exist
                {"role": "system", "content": message.system} if message.system else {},
                {"role": "user", "content": message.user},
            ],
        )
        return response.choices[0].message.content
