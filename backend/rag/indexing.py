from pathlib import Path
import logging
from typing import List
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from dotenv import load_dotenv
from uuid import UUID
from sqlalchemy.orm import Session
from models.raginstance_model import RAGInstance
import os 


CHUNK_SIZE = 1500
CHUNK_OVERLAP = 200
QDRANT_URL = 'http://localhost:6333'
COLLECTION_NAME = "data_structure_vector_store"
EMBEDDING_MODEL = 'text-embedding-3-large'


load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def validate_qdrant_connection(url: str) -> None:
    """Check if Qdrant is accessible"""
    try:
        client = QdrantClient(url=url)
        client.get_collections()
        logger.info("✓ Qdrant connection successful")
    except Exception as e:
        raise ConnectionError(f"Cannot connect to Qdrant at {url}: {e}")

def load_and_index_pdf(pdf_path: Path) -> QdrantVectorStore:
    """Load PDF, chunk it, and index into Qdrant"""
    
    # Validate PDF exists
    if not  os.path.isfile(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")
    
    # Load PDF
    logger.info(f"Loading PDF: {pdf_path}")
    try:
        loader = PyPDFLoader(file_path=str(pdf_path))
        docs = loader.load()
        logger.info(f"✓ Loaded {len(docs)} pages")
    except Exception as e:
        logger.error(f"Error loading PDF: {e}")
        raise
    
    # Split documents
    logger.info("Splitting documents into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", " ", ""]
    )
    chunks = text_splitter.split_documents(documents=docs)
    
    # Add metadata
    for i, chunk in enumerate(chunks):
        chunk.metadata.update({
            "source": pdf_path.name,
            "chunk_id": i,
            "total_chunks": len(chunks)
        })
    
    logger.info(f"✓ Created {len(chunks)} chunks")
    
    # Create embeddings and index
    logger.info("Creating embeddings and indexing...")
    embedding_model = OpenAIEmbeddings(model=EMBEDDING_MODEL)
    
    vector_store = QdrantVectorStore.from_documents(
        documents=chunks,
        embedding=embedding_model,
        url=QDRANT_URL,
        collection_name=COLLECTION_NAME,
        batch_size=100
    )
    
    logger.info(f"✓ Successfully indexed {len(chunks)} chunks to Qdrant")
    return vector_store


def rag_indexing(rag_id : UUID , db : Session):
    # Validate connection
    try:
     logger.info("Checking the qdrant connection")
     validate_qdrant_connection(QDRANT_URL)
    
     logger.info("Checking if the rag exists")
     rag= db.query(RAGInstance).filter(RAGInstance.id == rag_id).first()
    
     if not rag:
         raise ValueError("rag not found")
    
    # Todo do a alembic push to change and add a processing status in the rag databse
    #rag.status = "processing"
     #db.commit()
     #db.refresh(rag) 
     
    # Index PDF
     folder_path = f"uploads/{rag_id}"
     logger.info("File indexing is started")
     for doc in os.listdir(folder_path):
         pdf_path = os.path.join(folder_path,doc)
         vector_store = load_and_index_pdf(pdf_path)
         
         # Todo log the vector store when it is working an dstor ethe point_ids to the document database and there add teh processed_at time and total chunks also.
    
     logger.info("Indexing complete!")
     
    except Exception as e:
        logger.info(f"Error occured while indexing the documnet {e}")
        