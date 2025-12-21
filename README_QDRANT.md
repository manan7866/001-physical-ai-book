# Qdrant Documentation Loader

This project contains a script to load your documentation files into Qdrant for vector search capabilities.

## Dependencies

The following Python packages are required:

- `qdrant-client` - For connecting to Qdrant vector database
- `markdown` - For parsing markdown files
- `beautifulsoup4` - For extracting text from HTML
- `sentence-transformers` - For generating text embeddings
- `torch` - PyTorch for deep learning models
- `transformers` - Hugging Face transformers library
- `numpy` - For numerical operations

## Installation

1. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

2. Make sure you have Python 3.8 or higher installed.

## Usage

### 1. Store Documentation in Qdrant

To store all your documentation files in Qdrant:

```python
python qdrant_loader.py
```

This will:
- Scan the `E:/humanoid-robotics-book/docs` directory for all `.md` files
- Extract text content from each markdown file
- Split large documents into smaller chunks
- Generate embeddings using the `all-MiniLM-L6-v2` model
- Store the content in your Qdrant collection named `humanoid_robotics_docs`

### 2. Search Documentation

You can also use the search functionality directly in your code:

```python
from qdrant_loader import search_docs

# Search for relevant documents
results = search_docs("your search query here")
for result in results:
    print(f"Score: {result['score']}")
    print(f"File: {result['file_name']}")
    print(f"Content: {result['content'][:200]}...")
    print("-" * 50)
```

## Configuration

The script is pre-configured with your Qdrant instance details:
- URL: `https://e96649f2-a409-4283-9883-23a2ac6a014e.us-east4-0.gcp.cloud.qdrant.io:6333`
- API Key: Your provided API key
- Collection name: `humanoid_robotics_docs`

## Notes

- The script will delete and recreate the collection if it already exists
- Documents are chunked into ~1000 character segments for better retrieval
- Each chunk includes metadata like file path and chunk index
- The embedding model used is `all-MiniLM-L6-v2` which provides good performance with reasonable speed