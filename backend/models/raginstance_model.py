from sqlalchemy import Column,String,UUID,ForeignKey,Text,Integer,Boolean
from db.supabase import Base
from sqlalchemy.orm import relationship
import uuid
from enum import Enum

class StatusEnum(str, Enum):
        PENDING = "pending"
        FAILED = "failed"
        READY = "completed"
        PROCESSING ='processing'

class RAGInstance(Base):
    __tablename__= "rag_instances"
    
    id= Column(UUID(as_uuid = True),primary_key=True,default=uuid.uuid4,index=True)
    user_id = Column(UUID(as_uuid=True),ForeignKey("users.id",ondelete="CASCADE"),nullable=False)


    name=Column(String(100),nullable=False)
    description= Column(Text,nullable=True) 
        
    qdrant_collection =Column(String(50),unique=True,nullable=False)
        
    embedding_model = Column(String(50),default="text-embedding-3-large")
    llm_model = Column(String(50),default="gpt-4o-mini")
    chunk_size = Column(Integer, default=1000)
    chunk_overlap = Column(Integer, default=400)
    top_k = Column(Integer, default=5)
        
    document_count = Column(Integer,default=0)
    is_active = Column(Boolean,default=True)
    status = Column(String(50),default=StatusEnum.PENDING.value)
    user = relationship("User", back_populates="rag_instances")
    documents = relationship("Document", back_populates="rag_instance", cascade="all, delete-orphan")
        
        
    def __repr__(self):
            return f"<RAGInstance(id={self.id}, name={self.name}, user_id={self.user_id})>"