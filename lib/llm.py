import os

import openai
from dotenv import load_dotenv

load_dotenv()

embedding_model = os.getenv(
    "EMBEDDING_MODEL",
    "text-embedding-3-small",
)


class LLMMessageBody:
    def __init__(self, user: str, system: str | None = None):
        self.system = system
        self.user = user


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
            default_headers={
                "User-Agent": "NewsFusion/1.0",
            },
        )

    def generate_embeddings(self, text: str):
        """
        Embed the text using the LLM model
        :param text: The text to embed
        :return: The response from the API in OpenAI format
        """

        response = self.client.embeddings.create(
            model=embedding_model,
            input=text,
        )

        return response

    def generate_text(self, message: LLMMessageBody, model: str | None = None) -> str:
        """
        Generate text using the LLM model
        :param model: The model to use for generating text (e.g. gpt-4o-mini)
        :param message: The message to generate text in class Messages, which contains system and user messages
        :return: The generated text
        """
        text_completion_model = os.getenv("TEXT_MODEL", "gpt-4o-mini")

        response = self.client.chat.completions.create(
            model=model or text_completion_model,
            messages=[
                # Only include system messages if they exist
                {"role": "system", "content": message.system} if message.system else {},
                {"role": "user", "content": message.user},
            ],
        )
        result = response.choices[0].message.content

        if not result:
            raise ValueError("No response from the model")

        return result
