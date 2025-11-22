from pydantic import BaseModel,EmailStr,Field
from datetime import datetime
from typing import Optional
from uuid import UUID

class UserCreate(BaseModel):
    email:EmailStr
    full_name:str
    password:str

class UserLogin(BaseModel):
    email: str
    password: str
        
class UserResponse(BaseModel):
    id:UUID
    email:str
    full_name:str
    created_at:datetime
    class Config:
        from_attributes = True
        
class AskRequest(BaseModel):
    query: str = Field(..., min_length=1, description="User query text")
    collection_name : str = Field(...,min_length=1,description="Rag collection name")
    embedding : str = Field(...,min_length=1,description="Embeddings model used")

class AskResponse(BaseModel):
    answer: str
    citations: list[dict] = []
    used_k: int = 0
        