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
from models.document_model import Document
from datetime import datetime
import os 


CHUNK_SIZE = 1500
CHUNK_OVERLAP = 200
QDRANT_URL = 'http://localhost:6333'

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

def load_and_index_pdf(pdf_path: Path,qdrant_collection:str) -> QdrantVectorStore:
    """Load PDF, chunk it, and index into Qdrant"""
    COLLECTION_NAME =qdrant_collection
    # Validate PDF exists
    if not  os.path.isfile(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")
    
    pdf_name = pdf_path.split("\\")[-1].split(".")

    
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
    
    logger.info("Splitting of the documents completed ")
    # Add metadata
    for i, chunk in enumerate(chunks):
        chunk.metadata.update({
            "source": pdf_name,
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
    logger.info(f"vector store : {vector_store}")
    return vector_store


def upload_ids_to_qdrant(document_id : UUID,collection_name:str, db:Session):
    try:
        logger.info("Checking qdrant connection")
        qdrant_client = QdrantClient(url="http://localhost:6333")
        
        point_ids=[]
        offset=None
        
        while True:
            result, next_offset = qdrant_client.scroll(
            collection_name=collection_name,
            scroll_filter={
                "must": [
                    {
                        "key": "document_id",
                        "match": {"value": str(document_id)}
                    }
                ]
            },
            limit=100,
            offset=offset,
            with_payload=False,
            with_vectors=False
        )
            point_ids.extend([point.id for point in result])    
            
            if next_offset is None:
                break
            offset = next_offset
        
        document = db.query(Document).filter(Document.id == document_id).first()
        if document :
            document.qdrant_point_ids = point_ids 
            document.total_chunks = len(point_ids)
            document.processed_at = datetime.utcnow()
            db.commit()
        return point_ids     
    except Exception as e:
        logger.info(f"Error while storing the point_ids {e}")       
             
def rag_indexing(rag_id : UUID , db : Session,qdrant_collection:str,document_ids : List[str]):
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
         vector_store = load_and_index_pdf(pdf_path,qdrant_collection)
      
     logger.info("Indexing complete!")
     
     logger.info("Uploading the point_ids to the document model") 
     for document_id in document_ids:
         ids=  upload_ids_to_qdrant(document_id,qdrant_collection,db)    
         
     logger.info(f"Uploading of the point_ids completed ! {ids}")      
    
     
     
    except Exception as e:
        logger.info(f"Error occured while indexing the documnet {e}")
        