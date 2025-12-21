# RAG Chatbot Integration

This document describes the integration of the RAG (Retrieval Augmented Generation) chatbot into the main project.

## Overview

The RAG chatbot has been fully integrated into the main project at `E:\humanoid-robotics-book`. This eliminates the need for separate backend projects and ensures proper deployment without path issues.

## Components

### Frontend
- Located at: `src/components/RAGChatbot/`
- Updated to use configurable API base URLs
- Supports both development (localhost) and production (relative) API calls

### Backend
- Located at: `backend/`
- FastAPI-based server with RAG functionality
- Qdrant vector database integration
- Google Gemini LLM integration (optional)
- Complete API endpoints for chat and document retrieval

## API Endpoints

The backend provides the following endpoints that the frontend expects:

- `POST /api/chat/chat` - Main chat functionality
- `POST /api/rag/text-selection` - Text selection queries
- Health check endpoints

## Configuration

### Environment Variables

Frontend (in .env or build environment):
- `REACT_APP_API_BASE_URL` - Base URL for API calls (defaults to localhost:8000 in dev, relative path in prod)

Backend (in backend/.env):
- `QDRANT_URL` - Qdrant database URL
- `QDRANT_API_KEY` - Qdrant API key
- `QDRANT_COLLECTION` - Qdrant collection name
- `GEMINI_API_KEY` - Google Gemini API key (optional)
- `PORT` - Server port (default 8000)

## Running the Project

### Development
```bash
# Run frontend, auth server, and backend together
npm run dev-full

# Or run separately:
npm start  # Frontend
npm run auth-server  # Auth server
cd backend && python -m uvicorn main:app --reload  # Backend
```

### Production Build
```bash
npm run build  # Builds the frontend
```

### Docker Deployment
```bash
docker-compose up --build
```

## Deployment

The project is now completely self-contained and can be deployed without external dependencies on separate backend projects. The RAG chatbot will work correctly with the integrated backend API.