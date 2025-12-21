from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import os
from typing import List, Dict
import logging

load_dotenv()

logger = logging.getLogger(__name__)

class QdrantRAGClient:
    def __init__(self, collection_name: str = "humanoid_robotics_docs"):
        qdrant_url = os.getenv("QDRANT_URL")
        qdrant_api_key = os.getenv("QDRANT_API_KEY")

        if not qdrant_url or not qdrant_api_key:
            raise RuntimeError(
                "QDRANT_URL or QDRANT_API_KEY missing in .env file"
            )

        self.client = QdrantClient(
            url=qdrant_url,
            api_key=qdrant_api_key,
        )

        self.collection_name = collection_name
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

    def search(self, query: str, limit: int = 5):
        """Search for relevant documents in Qdrant based on the query"""
        try:
            query_embedding = self.model.encode(
                query,
                normalize_embeddings=True
            ).tolist()

            search_results = self.client.query_points(
                collection_name=self.collection_name,
                query=query_embedding,
                limit=limit,
                with_payload=True,
            )

            results = []
            for point in search_results.points:
                payload = point.payload or {}
                results.append({
                    "score": point.score,
                    "content": payload.get("content", ""),
                    "file_path": payload.get("file_path"),
                    "file_name": payload.get("file_name"),
                    "chunk_index": payload.get("chunk_index"),
                })

            return results
        except Exception as e:
            logger.error(f"Error searching in Qdrant: {str(e)}")
            raise

    def get_collection_info(self):
        """Get information about the collection"""
        try:
            return self.client.get_collection(self.collection_name)
        except Exception as e:
            logger.error(f"Error getting collection info: {str(e)}")
            raise