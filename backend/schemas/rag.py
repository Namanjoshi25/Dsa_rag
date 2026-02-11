from pydantic import BaseModel, Field, conint, constr
from typing import Optional

class RagCreate(BaseModel):
    name: str = Field(max_length=100)
    description: Optional[str] = None
    qdrant_collection: str = Field(max_length=50)
    embedding_model: str = "text-embedding-3-large"
    llm_model: str = "gpt-4o-mini"
    chunk_size: int = Field(gt=0, default=1000)
    chunk_overlap: int = Field(ge=0, default=400)
    top_k: int = Field(gt=0, default=5)
    document_count: int = Field(ge=0, default=0)
    is_active: bool = True

    class Config:
        from_attributes = True