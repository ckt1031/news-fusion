import os
from uuid import uuid4

import openai
from dotenv import load_dotenv
from loguru import logger
from qdrant_client import QdrantClient, models
from qdrant_client.models import Distance, HnswConfigDiff, PointStruct, VectorParams

load_dotenv()

EMBEDDING_SIZE = 1536

QDRANT_CONNECTION_STRING = os.getenv("QDRANT_CONNECTION_STRING")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")


class News:
    def __init__(
        self,
        title: str,
        content_embedding: openai.types.CreateEmbeddingResponse,
        link: str,
    ):
        self.title = title
        self.content_embedding = content_embedding
        self.link = link


class Qdrant:
    def __init__(self):
        if not QDRANT_CONNECTION_STRING:
            raise Exception("QDRANT_CONNECTION is not set")

        self.client = QdrantClient(
            url=QDRANT_CONNECTION_STRING,
            api_key=QDRANT_API_KEY,
        )
        self.collection_name = "news"

        self.create_collection()

    def create_collection(self):
        if self.client.collection_exists(self.collection_name):
            return

        self.client.create_collection(
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

    def find_out_similar_news(self, news: News):
        result = self.client.query_points(
            collection_name=self.collection_name,
            query=news.content_embedding.data[0].embedding,
            with_vectors=False,
            with_payload=True,
            limit=5,
            # search_params=SearchParams(hnsw_ef=512, exact=False),
        ).points

        # sort score in descending order
        result = sorted(result, key=lambda x: x.score, reverse=True)

        return result

    def insert_news(self, news: News):
        idx = uuid4().hex

        points = [
            PointStruct(
                id=idx,
                vector=news.content_embedding.data[0].embedding,
                payload={
                    "link": news.link,
                    "title": news.title,
                },
            )
        ]

        self.client.upsert(self.collection_name, points, wait=True)
