from sqlalchemy import Column , Integer,String,DateTime,UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from db.supabase import Base
import uuid



class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String,unique=True,index=True,nullable=False)
    password = Column(String,nullable=False)
    full_name  = Column(String,nullable=False)
    created_at = Column(DateTime,default=datetime.utcnow)
    updated_at = Column(DateTime,default=datetime.utcnow,onupdate=datetime.utcnow)

    rag_instances = relationship("RAGInstance", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, username={self.full_name})>"    