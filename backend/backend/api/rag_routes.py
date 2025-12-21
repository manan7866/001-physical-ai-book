from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
import logging

from models.rag_models import QueryRequest, QueryResponse, DocumentChunk
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

class TextSelectionRequest(BaseModel):
    text: str
    context: Optional[str] = None
    user_id: Optional[str] = None  # Add user_id parameter

class TextSelectionResponse(BaseModel):
    query: str
    relevant_documents: List[DocumentChunk]
    answer: str

@router.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    """
    Search the documentation for relevant information based on the query
    """
    try:
        results = rag_client.search(request.query, limit=request.limit or 5)

        documents = []
        for result in results:
            documents.append(DocumentChunk(
                score=result['score'],
                content=result['content'],
                file_path=result['file_path'],
                file_name=result['file_name'],
                chunk_index=result.get('chunk_index', 0)
            ))

        return QueryResponse(
            query=request.query,
            relevant_documents=documents,
            total_results=len(documents)
        )
    except Exception as e:
        logger.error(f"Error querying documents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error querying documents: {str(e)}")

@router.post("/text-selection", response_model=TextSelectionResponse)
async def handle_text_selection(request: TextSelectionRequest):
    """
    Process selected text and provide relevant information from documentation with user preferences
    """
    try:
        # Get user profile if user_id is provided
        user_profile = None
        if request.user_id:
            profile = profile_manager.get_user_profile(request.user_id)
            if profile:
                user_profile = profile.dict()

        # Create a query based on the selected text
        query = f"Explain this concept: {request.text}"
        if request.context:
            query = f"Context: {request.context}. Explain this text: {request.text}"

        # Search for relevant documents
        results = rag_client.search(query, limit=3)

        documents = []
        for result in results:
            documents.append(DocumentChunk(
                score=result['score'],
                content=result['content'],
                file_path=result['file_path'],
                file_name=result['file_name'],
                chunk_index=result.get('chunk_index', 0)
            ))

        # Prepare context from documents for LLM
        context_str = ""
        if documents:
            for doc in documents:
                context_str += f"Document: {doc.file_name}\n{doc.content}\n\n"

        # Generate response using LLM with user preferences
        answer = llm_client.generate_explanation(
            selected_text=request.text,
            context=context_str,
            user_profile=user_profile
        )

        return TextSelectionResponse(
            query=query,
            relevant_documents=documents,
            answer=answer
        )
    except Exception as e:
        logger.error(f"Error processing text selection: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing text selection: {str(e)}")

@router.get("/collections")
async def get_collections():
    """
    Get information about available collections in Qdrant
    """
    try:
        info = rag_client.get_collection_info()
        return {
            "collection_name": info.config.params.vectors_count,
            "vectors_count": info.vectors_count,
            "points_count": info.points_count
        }
    except Exception as e:
        logger.error(f"Error getting collection info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting collection info: {str(e)}")