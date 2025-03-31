from functools import cache

from fastapi.responses import Response
from fastapi_cache import Coder
from feedgen.feed import FeedGenerator


# Coder for XML response, used in FastAPI rate limiter
class AtomXMLResponseCoder(Coder):
    @classmethod
    def encode(cls, value: Response) -> bytes:
        return value.body

    @classmethod
    def decode(cls, value: bytes) -> Response:
        value_str = value.decode("utf-8")

        # Throw error if the response is not XML
        if not value_str.startswith("<?xml"):
            raise ValueError("Response is not XML")

        return Response(
            content=value,
            media_type="application/atom+xml",
        )


# Generate example RSS for OpenAPI
@cache
def get_example_atom() -> str:
    fg = FeedGenerator()
    fg.title("News Fusion - World")
    fg.link(href="https://example.com/feed/world", rel="self")
    fg.id("https://example.com/feed/world")

    # Example article: OpenAI releases GPT-1
    fe = fg.add_entry()
    fe.id("https://example.com/article/1")
    fe.title("OpenAI releases GPT-1")
    fe.link(href="https://example.com/article/1", rel="alternate")
    fe.description("OpenAI releases GPT-1, a new language model.")

    # Example article: Tesla's new electric car
    fe = fg.add_entry()
    fe.id("https://example.com/article/2")
    fe.title("Tesla's new electric car")
    fe.link(href="https://example.com/article/2", rel="alternate")
    fe.description("Tesla's new electric car is a game-changer.")

    return fg.atom_str(pretty=True)
