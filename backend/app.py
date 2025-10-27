from fastapi import FastAPI,Request,HTTPException
import uvicorn
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from rag import pipeline
from pydantic import BaseModel,Field
from routes import auth
load_dotenv()


APP_NAME = os.getenv("APP_NAME", "rag-backend")
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",")]

app = FastAPI(title=APP_NAME, docs_url="/docs", redoc_url="/redoc", openapi_url="/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,  # THIS IS CRITICAL
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])


class AskRequest(BaseModel):
    query: str = Field(..., min_length=1, description="User query text")

class AskResponse(BaseModel):
    answer: str
    citations: list[dict] = []
    used_k: int = 0

@app.post("/ask", response_model=AskResponse, summary="Send user query to LLM and vector store")
async def ask_rag(body: AskRequest):
    q = body.query.strip()
    if not q:
        raise HTTPException(status_code=400, detail="User query is required")

    try:
        # process_query is sync -> run it in a thread
        print("Query recieved")
        result = await asyncio.to_thread(pipeline.process_query, q)
        print(result)
        return result.answer  # FastAPI will validate/shape it to AskResponse
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG error: {e}")
 
if __name__ == '__main__':
    uvicorn.run(app, host=HOST, port=PORT)