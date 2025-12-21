import os
from qdrant_client import QdrantClient
from qdrant_client.http import models
import markdown
from bs4 import BeautifulSoup
import uuid
from typing import List, Dict
import re

def extract_text_from_md(file_path: str) -> str:
    """Extract text content from markdown file"""
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # Convert markdown to HTML then extract text
    html = markdown.markdown(content)
    soup = BeautifulSoup(html, 'html.parser')
    text = soup.get_text()

    # Clean up text
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def chunk_text(text: str, chunk_size: int = 1000) -> List[str]:
    """Split text into chunks of specified size"""
    sentences = re.split(r'[.!?]+', text)
    chunks = []
    current_chunk = ""

    for sentence in sentences:
        sentence = sentence.strip()
        if len(current_chunk) + len(sentence) < chunk_size:
            current_chunk += " " + sentence
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = sentence

    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks

def store_docs_in_qdrant():
    # Initialize Qdrant client
    qdrant_client = QdrantClient(
        url="https://e96649f2-a409-4283-9883-23a2ac6a014e.us-east4-0.gcp.cloud.qdrant.io:6333",
        api_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.0xMam28esMmQuvWx7fQjElLEiFb9MA3Fn-wfSqa9GCc",
    )

    # Define collection name
    collection_name = "humanoid_robotics_docs"

    # Delete collection if it exists (optional - remove if you want to append)
    try:
        qdrant_client.delete_collection(collection_name)
    except:
        pass  # Collection doesn't exist yet

    # Create collection
    qdrant_client.create_collection(
        collection_name=collection_name,
        vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE)  # Using sentence-transformers model
    )

    # Import sentence transformers for embedding generation
    from sentence_transformers import SentenceTransformer

    # Load a pre-trained sentence transformer model
    model = SentenceTransformer('all-MiniLM-L6-v2')

    # Get all markdown files from docs directory
    docs_dir = "E:/humanoid-robotics-book/docs"
    md_files = []

    for root, dirs, files in os.walk(docs_dir):
        for file in files:
            if file.endswith('.md'):
                md_files.append(os.path.join(root, file))

    print(f"Found {len(md_files)} markdown files")

    # Process each file and store in Qdrant
    points = []
    for i, file_path in enumerate(md_files):
        print(f"Processing {file_path} ({i+1}/{len(md_files)})")

        try:
            # Extract text content
            full_text = extract_text_from_md(file_path)

            # Create chunks if text is too long
            chunks = chunk_text(full_text)

            for j, chunk in enumerate(chunks):
                if len(chunk.strip()) == 0:
                    continue

                # Generate embedding
                embedding = model.encode([chunk])[0].tolist()

                # Create a unique ID for this chunk
                point_id = str(uuid.uuid4())

                # Create payload with metadata
                payload = {
                    "content": chunk,
                    "file_path": file_path,
                    "file_name": os.path.basename(file_path),
                    "chunk_index": j,
                    "full_text_length": len(full_text),
                    "chunk_length": len(chunk)
                }

                # Add to points list
                points.append(
                    models.PointStruct(
                        id=point_id,
                        vector=embedding,
                        payload=payload
                    )
                )

                # Batch insert every 100 points to avoid memory issues
                if len(points) >= 100:
                    qdrant_client.upsert(
                        collection_name=collection_name,
                        points=points
                    )
                    print(f"Uploaded {len(points)} points to Qdrant")
                    points = []

        except Exception as e:
            print(f"Error processing {file_path}: {str(e)}")
            continue

    # Upload remaining points
    if points:
        qdrant_client.upsert(
            collection_name=collection_name,
            points=points
        )
        print(f"Uploaded final {len(points)} points to Qdrant")

    # Verify collection
    collection_info = qdrant_client.get_collection(collection_name)
    print(f"Collection '{collection_name}' created with {collection_info.points_count} points")

    return collection_name

def search_docs(query: str, collection_name: str = "humanoid_robotics_docs", limit: int = 5):
    """Search documents in Qdrant"""
    qdrant_client = QdrantClient(
        url="https://e96649f2-a409-4283-9883-23a2ac6a014e.us-east4-0.gcp.cloud.qdrant.io:6333",
        api_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.0xMam28esMmQuvWx7fQjElLEiFb9MA3Fn-wfSqa9GCc",
    )

    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer('all-MiniLM-L6-v2')

    # Generate query embedding
    query_embedding = model.encode([query])[0].tolist()

    # Search in Qdrant
    search_results = qdrant_client.search(
        collection_name=collection_name,
        query_vector=query_embedding,
        limit=limit,
        with_payload=True
    )

    results = []
    for result in search_results:
        results.append({
            "score": result.score,
            "content": result.payload["content"],
            "file_path": result.payload["file_path"],
            "file_name": result.payload["file_name"]
        })

    return results

if __name__ == "__main__":
    print("Starting to store documentation in Qdrant...")
    collection_name = store_docs_in_qdrant()
    print(f"Documentation successfully stored in collection: {collection_name}")

    # Example search
    print("\nExample search:")
    query = "humanoid robotics"
    results = search_docs(query, collection_name)
    for i, result in enumerate(results):
        print(f"\nResult {i+1} (Score: {result['score']:.3f}):")
        print(f"File: {result['file_name']}")
        print(f"Content preview: {result['content'][:200]}...")
        print("-" * 50)