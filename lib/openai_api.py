import tiktoken
from loguru import logger
from openai import AsyncOpenAI
from openai.types import CreateEmbeddingResponse

from lib.env import get_env


class MessageBody:
    def __init__(self, user: str, system: str | None = None):
        self.system = system
        self.user = user


def count_tokens(text: str) -> int:
    o200k_base = tiktoken.get_encoding("o200k_base")
    return len(o200k_base.encode(text))


class OpenAIAPI:
    def __init__(self):
        self.api_key = get_env("OPENAI_API_KEY")
        self.text_completion_model = get_env("OPENAI_CHAT_MODEL", "gpt-4o-mini")

        if not self.api_key:
            raise Exception("OPENAI_API_KEY is not set")

        self.api_base_url = get_env("OPENAI_API_BASE_URL", "https://api.openai.com/v1")
        self.client = AsyncOpenAI(
            api_key=self.api_key,
            base_url=self.api_base_url,
        )

    async def generate_embeddings(self, text: str) -> CreateEmbeddingResponse:
        """
        Embed the text using the LLM model
        :param text: The text to embed
        :return: The response from the API in OpenAI format
        """
        embedding_model = get_env(
            "OPENAI_EMBEDDING_MODEL",
            "text-embedding-3-small",
        )

        token = count_tokens(text)

        logger.info(f"Generating embeddings using the LLM model: {token} tokens")

        response = await self.client.embeddings.create(
            model=embedding_model,
            input=text,
        )

        return response

    async def generate_schema(
        self, message: MessageBody, schema, model: str | None = None
    ):
        token = count_tokens(message.system + message.user)

        logger.info(f"Generating schema using the LLM model: {token} tokens")

        completion = await self.client.beta.chat.completions.parse(
            model=model or self.text_completion_model,
            messages=[
                {"role": "system", "content": message.system},
                {"role": "user", "content": message.user},
            ],
            response_format=schema,
        )

        res = completion.choices[0].message

        if not res:
            raise ValueError("No schema response from the model")

        if res.refusal:
            raise Exception(f"OpenAI chat completion refusal: {res.refusal}")

        # Type check the parsed response
        schema.model_validate(res.parsed)

        return res.parsed

    async def generate_text(
        self, message: MessageBody, model: str | None = None
    ) -> str:
        """
        Generate text using the LLM model
        :param model: The model to use for generating text (e.g. gpt-4o-mini)
        :param message: The message to generate text in class Messages, which contains system and user messages
        :return: The generated text
        """
        token = count_tokens(message.system + message.user)
        logger.info(f"Generating text using the LLM model: {token} tokens")

        response = await self.client.chat.completions.create(
            model=model or self.text_completion_model,
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
