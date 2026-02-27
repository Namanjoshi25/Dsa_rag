from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
import asyncio

from sqlalchemy.orm import Session
from db.supabase import get_db
from rag.pipeline import process_query, process_query_stream
from models.user_model import User
from schemas.user_schema import AskRequest, AskResponse
from core.deps import get_current_user
from models.raginstance_model import RAGInstance
from uuid import UUID

router = APIRouter()


@router.post("/ask", response_model=AskResponse, summary="Send user query to LLM and vector store")
async def ask_rag(body: AskRequest , db:Session=Depends(get_db),
    user:User = Depends(get_current_user)):
    query = body.query.strip()
    collection_name = body.collection_name
    embedding = body.embedding
    if not query:
        raise HTTPException(status_code=400, detail="User query is required")
    rag = db.query(RAGInstance).filter(RAGInstance.qdrant_collection == collection_name).first()
    if not rag:
        raise HTTPException(status_code=404, detail="RAG not found")
    if rag.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not allowed to query this RAG")
    
    try:
        result = await asyncio.to_thread(process_query, query, collection_name, embedding)
        print(result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG error: {e}")


@router.post("/ask/stream", summary="Stream LLM response token-by-token")
async def ask_rag_stream(
    body: AskRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = body.query.strip()
    collection_name = body.collection_name
    embedding = body.embedding
    if not query:
        raise HTTPException(status_code=400, detail="User query is required")
    rag = db.query(RAGInstance).filter(RAGInstance.qdrant_collection == collection_name).first()
    if not rag:
        raise HTTPException(status_code=404, detail="RAG not found")
    if rag.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not allowed to query this RAG")

    def generate():
        for text in process_query_stream(query, collection_name, embedding):
            if text:
                yield text.encode("utf-8")

    return StreamingResponse(
        generate(),
        media_type="text/plain; charset=utf-8",
    ) 
 
 
 