from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import asyncio
from rag.pipeline import process_query, process_query_stream
from schemas.user_schema import AskRequest, AskResponse
from uuid import UUID

router = APIRouter()


@router.post("/ask", response_model=AskResponse, summary="Send user query to LLM and vector store")
async def ask_rag(body: AskRequest):
    query = body.query.strip()
    print(body)
    collection_name = body.collection_name
    embedding = body.embedding
    if not query:
        raise HTTPException(status_code=400, detail="User query is required")
    try:
        result = await asyncio.to_thread(process_query, query, collection_name, embedding)
        print(result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG error: {e}")


@router.post("/ask/stream", summary="Stream LLM response token-by-token")
async def ask_rag_stream(body: AskRequest):
    query = body.query.strip()
    collection_name = body.collection_name
    embedding = body.embedding
    if not query:
        raise HTTPException(status_code=400, detail="User query is required")

    def generate():
        for text in process_query_stream(query, collection_name, embedding):
            if text:
                yield text.encode("utf-8")

    return StreamingResponse(
        generate(),
        media_type="text/plain; charset=utf-8",
    ) 
 
 
 