from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DocumentChunk(BaseModel):
    score: float
    content: str
    file_path: Optional[str] = None
    file_name: Optional[str] = None
    chunk_index: Optional[int] = 0

class QueryRequest(BaseModel):
    query: str
    limit: Optional[int] = 5

class QueryResponse(BaseModel):
    query: str
    total_results: int
    relevant_documents: List[DocumentChunk]

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[datetime] = None

class ChatRequest(BaseModel):
    message: str
    chat_history: Optional[List[ChatMessage]] = None
    context_window: Optional[int] = 10

class ChatResponse(BaseModel):
    query: str
    message: str
    relevant_documents: List[dict]  # List of documents with context