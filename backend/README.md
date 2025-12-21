# Physical AI & Humanoid Robotics RAG Chatbot

This is a Retrieval-Augmented Generation (RAG) chatbot that answers questions based on the Physical AI & Humanoid Robotics documentation stored in Qdrant.

## Overview

The chatbot uses:
- Qdrant vector database containing all documentation from the humanoid robotics book
- Google's Gemini model for natural language processing
- Sentence transformers for semantic search
- OpenAI-agents framework for the conversational interface

## Setup

1. Install the required dependencies:
```bash
pip install -e .
```

2. Create a `.env` file in the root directory with your API key:
```env
GEMINI_API_KEY=your_api_key_here
```

3. Make sure your Qdrant instance is accessible with the stored documentation

## Usage

Run the chatbot:
```bash
python main.py
```

The chatbot will:
1. Accept user questions about robotics, AI, ROS 2, Isaac, etc.
2. Search the documentation using semantic similarity
3. Provide answers based on the retrieved information
4. Cite the source documents when providing answers

## Testing

To verify your Qdrant connection is working:
```bash
python test_qdrant.py
```

## Architecture

- `main.py`: Main application with the RAG agent
- `qdrant_rag.py`: Qdrant client for vector search
- `connection.py`: Configuration for the LLM connection
- `agents`: Framework for creating conversational agents

## Features

- Semantic search through documentation
- Source citation for answers
- Context-aware responses
- Conversational interface