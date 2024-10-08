import os
from logging import logger
from uuid import uuid4

from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, HnswConfigDiff, PointStruct, VectorParams

from llm import LLM, get_embedding_model

load_dotenv()

EMBEDDING_SIZE = 1536
EMBEDDING_MODEL = get_embedding_model()

QDRANT_CONNECTION_STRING = os.getenv("QDRANT_CONNECTION_STRING")


class News:
    def __init__(self, title: str, content: str, link: str):
        self.title = title
        self.content = content
        self.link = link


class VectorDB:
    def __init__(self):
        if not QDRANT_CONNECTION_STRING:
            raise Exception("QDRANT_CONNECTION is not set")

        self.client = QdrantClient(url=QDRANT_CONNECTION_STRING)
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
            hnsw_config=HnswConfigDiff(on_disk=True),
            # quantization_config=ScalarQuantization(
            #     scalar=ScalarQuantizationConfig(
            #         type=ScalarType.INT8,
            #         always_ram=True,
            #     ),
            # ),
        )

        logger.success(f"Collection {self.collection_name} created")

    def find_out_similar_news(self, news: News):
        model = LLM()

        content_embedding = model.embed(news.content)

        result = self.client.query_points(
            collection_name=self.collection_name,
            query=content_embedding.data[0].embedding,
            with_vectors=False,
            with_payload=True,
            limit=5,
            # search_params=SearchParams(hnsw_ef=512, exact=False),
        ).points

        # sort score in descending order
        result = sorted(result, key=lambda x: x.score, reverse=True)

        return result

    def insert_news(self, news: News):
        model = LLM()

        content_embedding = model.embed(news.content)

        idx = uuid4().hex

        points = [
            PointStruct(
                id=idx,
                vector=content_embedding.data[0].embedding,
                payload={
                    "content": news.content,
                    "title": news.title,
                    "link": news.link,
                },
            )
        ]

        self.client.upsert(self.collection_name, points, wait=True)
