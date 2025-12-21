# Physical AI & Humanoid Robotics RAG Chatbot - FastAPI Backend

This document describes the FastAPI-based backend for the Physical AI & Humanoid Robotics RAG chatbot with text selection features.

## Overview

The backend provides a REST API and WebSocket interface for the RAG chatbot with the following features:
- Semantic search through Physical AI & Humanoid Robotics documentation
- Text selection and explanation functionality
- Real-time chat capabilities
- Source citation for answers
- Context-aware responses

## Architecture

```
Frontend (HTML/CSS/JS)
    ↓ (HTTP/WebSocket requests)
FastAPI Backend
    ↓ (API calls)
Qdrant Vector Database
    ↓ (LLM calls)
Gemini LLM
```

## API Endpoints

### RAG Endpoints (`/api/rag/`)

#### `POST /api/rag/query`
Search the documentation for relevant information.

**Request:**
```json
{
  "query": "your search query",
  "limit": 5
}
```

**Response:**
```json
{
  "query": "your search query",
  "total_results": 3,
  "relevant_documents": [
    {
      "score": 0.95,
      "content": "document content...",
      "file_path": "/path/to/file.md",
      "file_name": "file.md",
      "chunk_index": 0
    }
  ]
}
```

#### `POST /api/rag/text-selection`
Process selected text and provide relevant information.

**Request:**
```json
{
  "text": "selected text",
  "context": "optional context around the selected text"
}
```

**Response:**
```json
{
  "query": "query generated from selected text",
  "relevant_documents": [...],
  "answer": "explanation of the selected text"
}
```

#### `GET /api/rag/collections`
Get information about available collections in Qdrant.

### Chat Endpoints (`/api/chat/`)

#### `POST /api/chat/chat`
Process a chat message and return a response with RAG context.

**Request:**
```json
{
  "message": "user message",
  "chat_history": [
    {
      "role": "user",
      "content": "previous message"
    }
  ],
  "context_window": 10
}
```

**Response:**
```json
{
  "query": "user message",
  "message": "assistant response",
  "relevant_documents": [
    {
      "file_name": "doc.md",
      "content": "relevant content...",
      "score": 0.95
    }
  ]
}
```

#### `WebSocket /api/chat/ws/{client_id}`
Real-time chat via WebSocket connection.

## Environment Variables

Create a `.env` file in the root directory:

```env
QDRANT_URL=https://your-qdrant-instance.com:6333
QDRANT_API_KEY=your_qdrant_api_key
GEMINI_API_KEY=your_gemini_api_key
```

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create `.env` file with your API keys (see above)

3. Start the backend server:
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend

The frontend is located in the `frontend/` directory and provides:
- Real-time chat interface
- Text selection popup with "Ask" button
- Documentation sidebar
- Source citations for responses

To run the frontend:
```bash
cd frontend
npx http-server -p 3000
```

Then open `http://localhost:3000` in your browser.

## Text Selection Feature

The frontend includes advanced text selection capabilities:
1. Select any text in the documentation or on the page
2. A popup will appear with an "Ask" button
3. Click "Ask" to get an explanation of the selected text based on the documentation
4. The system will search the RAG database and provide a contextual response

## Development

The backend follows a modular architecture:
- `main.py` - FastAPI application entry point
- `api/` - API route definitions
- `models/` - Pydantic models
- `utils/` - Utility classes (Qdrant client, LLM client)

## Error Handling

The API includes comprehensive error handling:
- HTTP 400 for bad requests
- HTTP 500 for server errors
- Detailed error messages in the response body

## Security

- CORS middleware is configured (configure origins appropriately for production)
- API keys are loaded from environment variables
- Input validation using Pydantic models