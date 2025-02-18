import tiktoken
from loguru import logger
from openai import AsyncOpenAI
from openai.types import CreateEmbeddingResponse

from lib.env import get_env

TOKEN_ENCODER = "o200k_base"


def count_tokens(text: str) -> int:
    encoder = tiktoken.get_encoding(TOKEN_ENCODER)
    return len(encoder.encode(text))


class OpenAIAPI:
    def __init__(self):
        self.api_key = get_env("OPENAI_API_KEY")
        self.text_completion_model = get_env("OPENAI_CHAT_MODEL", "gpt-4o-mini")
        self.embedding_model = get_env(
            "OPENAI_EMBEDDING_MODEL",
            "text-embedding-3-small",
        )

        if not self.api_key:
            raise Exception("OPENAI_API_KEY is not set")

        self.api_base_url = get_env("OPENAI_API_BASE_URL", "https://api.openai.com/v1")
        self.client = AsyncOpenAI(
            api_key=self.api_key,
            base_url=self.api_base_url,
        )

    async def generate_embeddings(self, text: str) -> CreateEmbeddingResponse:
        token = count_tokens(text)

        logger.info(f"Generating embeddings using the LLM model: {token} tokens")

        response = await self.client.embeddings.create(
            model=self.embedding_model,
            input=text,
        )

        return response

    async def generate_schema(
        self,
        user_message: str,
        schema,
        system_message: str | None = None,
        model: str | None = None,
    ):
        token = count_tokens(system_message + user_message)

        logger.info(f"Generating schema using the LLM model: {token} tokens")

        completion = await self.client.beta.chat.completions.parse(
            model=model or self.text_completion_model,
            messages=[
                {"role": "system", "content": system_message} if system_message else {},
                {"role": "user", "content": user_message},
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
        self,
        user_message: str,
        system_message: str | None = None,
        model: str | None = None,
    ) -> str:
        token = count_tokens(system_message + user_message)
        logger.info(f"Generating text using the LLM model: {token} tokens")

        response = await self.client.chat.completions.create(
            model=model or self.text_completion_model,
            messages=[
                # Only include system messages if they exist
                {"role": "system", "content": system_message} if system_message else {},
                {"role": "user", "content": user_message},
            ],
        )
        result = response.choices[0].message.content

        if not result:
            raise ValueError("No response from the model")

        return result
