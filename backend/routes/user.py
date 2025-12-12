from fastapi import APIRouter,status,Path,Depends,HTTPException,Body,UploadFile,Form,File
from schemas.rag import RagCreate
from db.supabase import get_db
from sqlalchemy.orm import Session
from models.user_model import User
from models.raginstance_model import RAGInstance
from models.document_model import Document
from core.deps import get_current_user
from uuid import UUID
from typing import Optional,List
import os
from rag.indexing import rag_indexing
from rag.worker.tasks import rag_indexing_task
router= APIRouter()

# Rag Creation
@router.post("/create/{id}", status_code=status.HTTP_201_CREATED)
async def create_rag(
     id: UUID = Path(..., title="User ID", description="The ID of the user creating the RAG"),
    name: str = Form(...),
    description: Optional[str] = Form(None),
    qdrant_collection: str = Form(...),
    embedding_model: str = Form(...),
    llm_model: str = Form(...),
    chunk_size: int = Form(...),
    chunk_overlap: int = Form(...),
    top_k: int = Form(...),
    document_count: int = Form(0),
    is_active: bool = Form(True),
    # File uploads (1-3 files)
    documents: List[UploadFile] = File(..., min_length=1, max_length=3),
    # Dependencies
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
    
):
  
    user  = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(404,detail="User not found")
    
    

    existing_rag = db.query(RAGInstance).filter(RAGInstance.qdrant_collection == qdrant_collection).first()
    if existing_rag:
        raise HTTPException(400, "Rag with this name already exists")
    
    if chunk_overlap >=chunk_size:
        raise HTTPException(400,"Chunk overlap cannot be greater than chunk size")
    
    allowed_extensions = {".pdf",".md",".txt",".docx"}
    for doc in documents:
        file_ext = os.path.splitext(doc.filename)[1].lower()    
        if file_ext not in allowed_extensions:
            raise HTTPException(400,         detail=f"File {doc.filename} has invalid extension. Allowed: {allowed_extensions}"
)
    
    new_rag = RAGInstance(
      user_id=id,
        name=name,
        description=description,
        qdrant_collection=qdrant_collection,
        embedding_model=embedding_model,
        llm_model=llm_model,
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        top_k=top_k,
        document_count=len(documents),
        is_active=is_active,
        status="pending",
        
     
    )
    db.add(new_rag)
    db.commit()
    db.refresh(new_rag)
    #upload the document for now locally
    upload_dir = f"uploads/{new_rag.id}"
    os.makedirs(upload_dir,exist_ok=True)
    
    saved_files=[]
    for doc in documents:
        file_path = os.path.join(upload_dir, doc.filename)
        with open(file_path, "wb") as f:
            content = await doc.read()
            f.write(content)
        
        
        
      
        
       
        
    
    
    rag_indexing_task.delay(new_rag.id,qdrant_collection=qdrant_collection,user_id=id)

    return {
        "id": new_rag.id,
        "name": new_rag.name,
        "status": new_rag.status,
        "message": "RAG created successfully. Processing documents..."
    }
        

@router.get("/get-user-rags/{id}",status_code=status.HTTP_200_OK) 
async def get_user_rags(
    id:UUID = Path(...,title="User id" ,description="User id"),
    db:Session = Depends(get_db),
    user: User = Depends(get_current_user)
    ):
    try:
        user = db.query(User).filter(User.id == id).first()
    
        if not user:
            raise HTTPException(404,detail="User not found")
        
        rags = db.query(RAGInstance).filter(RAGInstance.user_id == id).all()
        
        return rags
        
    except Exception as e:
      print(f"Error occured while fetching the rags {e}")
      return
 

@router.get("/get-rag-info/{id}",status_code=status.HTTP_200_OK)
async def get_rag_info(
    id:UUID=Path(...,title="User id" ,description="User id"),
    db:Session = Depends(get_db),
    user:User = Depends(get_current_user)
): 
    try:
        rag= db.query(RAGInstance).filter(RAGInstance.id == id).first()
        
        return rag
    except Exception as e:
        print(f'An exception occurred {e}')
        return