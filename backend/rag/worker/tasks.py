from rag.worker.celery_app import celery_app
from rag.indexing import rag_indexing
from db.supabase import SessionLocal

@celery_app.task(bind=True)
def rag_indexing_task(self, rag_id, qdrant_collection, user_id):
    db = SessionLocal()
    try:
        rag_indexing(
            rag_id=rag_id,
            db=db,
            qdrant_collection=qdrant_collection,
            id=user_id
        )
    except Exception as e:
        # Optional: log error here
        raise e
    finally:
        db.close()
