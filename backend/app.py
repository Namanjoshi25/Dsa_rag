from fastapi import FastAPI
import uvicorn
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

from routes import auth,user,rag
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
app.include_router(user.router,prefix="/api/v1/user" , tags=["User"])
app.include_router(rag.router,prefix="/api/v1/rag",tags=['Rag'])

if __name__ == '__main__':
    uvicorn.run(app, host=HOST, port=PORT)