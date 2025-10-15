from sqlalchemy import Column ,DateTime,ForeignKey,String,BigInteger,Text,Integer
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID, JSONB

from sqlalchemy.orm  import relationship
import uuid
from db.supabase import Base


class Document(Base):
    __tablename__ = "documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    rag_id = Column(UUID(as_uuid=True), ForeignKey("rag_instances.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    filename = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False)  # Supabase Storage path
    file_type = Column(String(50), nullable=False)  # pdf, txt, docx, etc.
    file_size = Column(BigInteger, nullable=False)  # in bytes
    
    # Processing status: pending, processing, completed, failed
    status = Column(String(20), default="pending")
    error_message = Column(Text, nullable=True)
    
    # Qdrant tracking
    qdrant_point_ids = Column(JSONB, default=list)  # Array of point IDs in Qdrant
    total_chunks = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)
    
    # Relationships
    rag_instance = relationship("RAGInstance", back_populates="documents")
    user = relationship("User", back_populates="documents")
    
    def __repr__(self):
        return f"<Document(id={self.id}, filename={self.filename}, status={self.status})>"