# from qdrant_client import QdrantClient
# from qdrant_client.http import models
# from sentence_transformers import SentenceTransformer
# import os
# from typing import List, Dict, Optional

# class QdrantRAGClient:
#     def __init__(self, collection_name: str = "humanoid_robotics_docs"):
#         # Initialize Qdrant client with your instance details
#         self.client = QdrantClient(
#             url="https://e96649f2-a409-4283-9883-23a2ac6a014e.us-east4-0.gcp.cloud.qdrant.io:6333",
#             api_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.0xMam28esMmQuvWx7fQjElLEiFb9MA3Fn-wfSqa9GCc",
#         )
#         self.collection_name = collection_name
#         self.model = SentenceTransformer('all-MiniLM-L6-v2')

#     def search(self, query: str, limit: int = 5) -> List[Dict]:
#         """
#         Search for relevant documents in Qdrant based on the query
#         """
#         # Generate embedding for the query
#         query_embedding = self.model.encode([query])[0].tolist()

#         # Search in Qdrant
#         search_results = self.client.search(
#             collection_name=self.collection_name,
#             query_vector=query_embedding,
#             limit=limit,
#             with_payload=True
#         )

#         results = []
#         for result in search_results:
#             results.append({
#                 "score": result.score,
#                 "content": result.payload["content"],
#                 "file_path": result.payload["file_path"],
#                 "file_name": result.payload["file_name"],
#                 "chunk_index": result.payload["chunk_index"]
#             })

#         return results

#     def get_collection_info(self):
#         """
#         Get information about the collection
#         """
#         return self.client.get_collection(self.collection_name)

from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
import os
from typing import List, Dict

# Load environment variables from .env
load_dotenv()

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
      query_embedding = self.model.encode(
          query,
          normalize_embeddings=True
      ).tolist()
  
      search_results = self.client.query_points(
          collection_name=self.collection_name,
          query=query_embedding,   # ✅ THIS IS THE KEY
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




    # def search(self, query: str, limit: int = 5) -> List[Dict]:
    #     query_embedding = self.model.encode(
    #         query,
    #         normalize_embeddings=True
    #     ).tolist()

    #     search_results = self.client.search(
    #         collection_name=self.collection_name,
    #         query_vector=query_embedding,
    #         limit=limit,
    #         with_payload=True,
    #     )

    #     results = []
    #     for result in search_results:
    #         payload = result.payload or {}
    #         results.append({
    #             "score": result.score,
    #             "content": payload.get("content", ""),
    #             "file_path": payload.get("file_path"),
    #             "file_name": payload.get("file_name"),
    #             "chunk_index": payload.get("chunk_index"),
    #         })

    #     return results
