from celery import Celery
from dotenv import load_dotenv
import os

load_dotenv()

# REDIS_URL from docker-compose; CELERY_BROKER_URL from .env when running on host
_REDIS_URL = os.getenv("REDIS_URL") or os.getenv("CELERY_BROKER_URL") or "redis://valkey:6379/0"

celery_app = Celery(
    "rag_worker",
    broker=_REDIS_URL,
    backend=_REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
)

import rag.worker.tasks