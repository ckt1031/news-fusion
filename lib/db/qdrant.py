from datetime import datetime, timezone
from uuid import uuid4

import openai
from loguru import logger
from qdrant_client import AsyncQdrantClient, models
from qdrant_client.models import Distance, HnswConfigDiff, PointStruct, VectorParams

from lib.env import get_env

EMBEDDING_SIZE = 1536

QDRANT_CONNECTION_STRING = get_env("QDRANT_CONNECTION_STRING")
QDRANT_API_KEY = get_env("QDRANT_API_KEY")


class News:
    def __init__(
        self,
        content_embedding: openai.types.CreateEmbeddingResponse,
        link: str,
    ):
        self.content_embedding = content_embedding
        self.link = link


class Qdrant:
    def __init__(self):
        if not QDRANT_CONNECTION_STRING:
            raise Exception("QDRANT_CONNECTION is not set")

        self.client = AsyncQdrantClient(
            url=QDRANT_CONNECTION_STRING,
            api_key=QDRANT_API_KEY,
        )
        self.collection_name = "news"

    async def create_collection(self):
        if await self.client.collection_exists(self.collection_name):
            return

        await self.client.create_collection(
            collection_name=self.collection_name,
            vectors_config=VectorParams(
                size=EMBEDDING_SIZE, distance=Distance.COSINE, on_disk=True
            ),
            hnsw_config=HnswConfigDiff(
                m=64,
                ef_construct=512,
                on_disk=True,
            ),
            quantization_config=models.ScalarQuantization(
                scalar=models.ScalarQuantizationConfig(
                    type=models.ScalarType.INT8,
                ),
            ),
        )

        logger.success(f"Collection {self.collection_name} created")

    async def find_out_similar_news(self, news: News):
        result = await self.client.query_points(
            collection_name=self.collection_name,
            query=news.content_embedding.data[0].embedding,
            with_vectors=False,
            with_payload=True,
            limit=5,
            # search_params=SearchParams(hnsw_ef=512, exact=False),
        )

        points = result.points

        # sort score in descending order
        points = sorted(points, key=lambda x: x.score, reverse=True)

        return points

    async def insert_news(self, news: News):
        idx = uuid4().hex

        points = [
            PointStruct(
                id=idx,
                vector=news.content_embedding.data[0].embedding,
                payload={
                    "link": news.link,
                    "created_at": datetime.now(tz=timezone.utc),
                },
            )
        ]

        await self.client.upsert(self.collection_name, points, wait=True)
