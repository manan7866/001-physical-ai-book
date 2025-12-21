from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
import json

from models.rag_models import ChatMessage, ChatRequest, ChatResponse
from models.user_models import GetUserProfileResponse
from utils.qdrant_client import QdrantRAGClient
from utils.llm_client import LLMClient
from utils.user_profile_manager import UserProfileManager

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize clients
rag_client = QdrantRAGClient()
llm_client = LLMClient()
profile_manager = UserProfileManager()

class ChatSession:
    def __init__(self):
        self.messages: List[ChatMessage] = []

    def add_message(self, message: ChatMessage):
        self.messages.append(message)

    def get_context(self, limit: int = 10) -> List[ChatMessage]:
        # Return the last 'limit' messages as context
        return self.messages[-limit:]

class EnhancedChatRequest(BaseModel):
    message: str
    chat_history: Optional[List[ChatMessage]] = None
    context_window: Optional[int] = 10
    user_id: Optional[str] = None  # Add user_id parameter


@router.post("/chat", response_model=ChatResponse)
async def chat(request: EnhancedChatRequest):
    """
    Process a chat message and return a response with RAG context and user preferences
    """
    try:
        # Get user profile if user_id is provided
        user_profile = None
        if request.user_id:
            profile = profile_manager.get_user_profile(request.user_id)
            if profile:
                user_profile = profile.dict()

        # Search for relevant documents
        rag_results = rag_client.search(request.message, limit=3)

        # Prepare context from RAG results
        context = []
        for result in rag_results:
            context.append({
                "file_name": result['file_name'],
                "content": result['content'][:500],  # Limit content length
                "score": result['score']
            })

        # Generate response using LLM with RAG context and user preferences
        response_text = llm_client.generate_response(
            user_message=request.message,
            context=context,
            chat_history=request.chat_history or [],
            user_profile=user_profile
        )

        return ChatResponse(
            message=response_text,
            relevant_documents=context,
            query=request.message
        )
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

# In-memory storage for active connections (in production, use Redis or similar)
active_connections: Dict[str, WebSocket] = {}

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """
    WebSocket endpoint for real-time chat
    """
    await websocket.accept()
    active_connections[client_id] = websocket

    try:
        while True:
            data = await websocket.receive_text()
            request_data = json.loads(data)

            message = request_data.get("message", "")
            user_id = request_data.get("user_id", "")  # Get user_id from request
            if not message:
                continue

            # Get user profile if user_id is provided
            user_profile = None
            if user_id:
                profile = profile_manager.get_user_profile(user_id)
                if profile:
                    user_profile = profile.dict()

            # Process the message with RAG
            rag_results = rag_client.search(message, limit=3)

            # Prepare context from RAG results
            context = []
            for result in rag_results:
                context.append({
                    "file_name": result['file_name'],
                    "content": result['content'][:500],
                    "score": result['score']
                })

            # Generate response with user preferences
            response_text = llm_client.generate_response(
                user_message=message,
                context=context,
                user_profile=user_profile
            )

            response = {
                "type": "response",
                "message": response_text,
                "relevant_documents": context,
                "query": message
            }

            await websocket.send_text(json.dumps(response))

    except WebSocketDisconnect:
        active_connections.pop(client_id, None)
        logger.info(f"Client {client_id} disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        active_connections.pop(client_id, None)