from fastapi import APIRouter,HTTPException
import asyncio
from rag.pipeline import process_query
from schemas.user_schema import AskRequest,AskResponse
from uuid import UUID

router= APIRouter()



@router.post("/ask", response_model=AskResponse, summary="Send user query to LLM and vector store")
async def ask_rag(body: AskRequest):
    query = body.query.strip()
    print(body)
    collection_name = body.collection_name
    embedding = body.embedding
    if not query:
        raise HTTPException(status_code=400, detail="User query is required")

    try:
        # process_query is sync -> run it in a thread
        print("Query recieved")
        result = await asyncio.to_thread(process_query, query, collection_name, embedding)
        print(result)
        return result # FastAPI will validate/shape it to AskResponse
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG error: {e}") 
 