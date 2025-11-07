from fastapi import APIRouter,status,Path,Depends,HTTPException,Body
from schemas.rag import RagCreate
from db.supabase import get_db
from sqlalchemy.orm import Session
from models.user_model import User
from models.raginstance_model import RAGInstance
from core.deps import get_current_user
from uuid import UUID
router= APIRouter()

# Rag Creation
@router.post("/create/{id}",response_model=RagCreate,status_code=status.HTTP_201_CREATED)
def create_rag(
     id: UUID = Path(..., title="User ID", description="The ID of the user creating the RAG"),
    rag_data: RagCreate =  Body(...),
     user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
    
):
  
    user  = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(404,detail="User not found")
    
    

    existing_rag = db.query(RAGInstance).filter(RAGInstance.qdrant_collection == rag_data.qdrant_collection).first()
    if existing_rag:
        raise HTTPException(400, "Rag with this name already exists")
    
    return rag_data