# Docker & Indexing Fixes – Step-by-Step Explanation

This document explains every change made to fix Dockerization and embeddings, why each step was required, and why that approach was used.

---

## 1. Fix QDRANT_URL in `backend/rag/indexing.py`

### What was changed
- **Before:** `QDRANT_URL = 'http://localhost:6333'` (hardcoded)
- **After:** `load_dotenv()` first, then `QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")`

### Why it was required
Inside Docker, each service runs in its own container. In that container, `localhost` means “this container,” not your PC and not the Qdrant container. So when the backend (or Celery worker) tried to connect to `http://localhost:6333`, it was looking for Qdrant inside its own container, where Qdrant is not running. The connection failed and embeddings could not be stored.

### Why this approach was used
- Reading from the environment lets you use **one codebase** for both:
  - **Local:** `QDRANT_URL` can be unset → default `http://localhost:6333` works.
  - **Docker:** Compose sets `QDRANT_URL: http://qdrant:6333` so the app uses the Docker service name and connects to the Qdrant container.
- No code branches; only configuration changes between local and Docker.

---

## 2. Fix path handling in `backend/rag/indexing.py`

### What was changed
- **PDF name / source:**  
  - Before: `pdf_name = pdf_path.split("\\")[-1].split(".")`  
  - After: `pdf_name = os.path.splitext(os.path.basename(str(pdf_path)))[0]`
- **Document fields (filename, file_type):**  
  - Before: Used `pdf_path.split("\\")[-1]` and `pdf_path.split("\\")[1].split(".")`.  
  - After: `os.path.basename()`, `os.path.splitext()`, and `ext.lstrip(".")` so paths work on both Windows and Linux.

### Why it was required
- On Windows, paths use backslashes (`\`). On Linux (Docker), they use forward slashes (`/`).  
- `split("\\")` only works on Windows. In Docker (Linux), there are no `\`, so the split gave wrong or unexpected parts and could break metadata and file type.
- So indexing could fail or store wrong metadata when run inside Docker.

### Why this approach was used
- `os.path.basename()` and `os.path.splitext()` are part of the standard library and work on both Windows and Linux.
- No dependency on the path separator, so the same code works locally (Windows) and in Docker (Linux).

---

## 3. Add Celery worker service in `docker-compose.yml`

### What was changed
A new service was added:

```yaml
celery_worker:
  build: ./backend
  container_name: rag_celery_worker
  env_file:
    - ./backend/.env
  environment:
    QDRANT_URL: http://qdrant:6333
    CELERY_BROKER_URL: redis://valkey:6379/0
  volumes:
    - ./backend:/app
  command: celery -A rag.worker.celery_app worker -l info
  depends_on:
    - backend
    - qdrant
    - valkey
  restart: unless-stopped
```

### Why it was required
When you create a RAG, the backend does **not** run the heavy work (PDF loading, chunking, embeddings, Qdrant indexing) in the API process. It only enqueues a task:

- `rag_indexing_task.delay(new_rag.id, qdrant_collection=..., user_id=...)`

That task is sent to **Valkey (Redis)**. Some process must **consume** that queue and run the task. Without a Celery worker container, no process was consuming the queue, so:
- The RAG was created in the DB and files were saved (so “the RAG is created”),
- But the indexing task never ran, so embeddings were never built and nothing was written to Qdrant.

### Why this approach was used
- **Same image as backend:** The worker runs the same Python code (indexing, DB, Qdrant client), so building from `./backend` avoids maintaining a second image.
- **Same env and volume:** `env_file` and `environment` give it the same config as the backend (including `QDRANT_URL`). The volume `./backend:/app` ensures the worker sees the same `uploads/` directory where the backend saved the PDFs.
- **Explicit broker URL:** `CELERY_BROKER_URL: redis://valkey:6379/0` guarantees that inside Docker the worker talks to the Valkey service by name, not localhost.
- **depends_on:** Ensures Valkey and Qdrant (and backend) are up before the worker starts, so it doesn’t fail on first connect.

---

## 4. Set QDRANT_URL for backend in `docker-compose.yml`

### What was changed
Under the `backend` service, `environment` was added:

```yaml
environment:
  QDRANT_URL: http://qdrant:6333
```

### Why it was required
The backend not only creates RAGs; it also deletes them. Deletion uses the Qdrant client and `os.getenv("QDRANT_URL", "http://localhost:6333")` in `routes/user.py`. If we didn’t set `QDRANT_URL` in Docker, the backend would still use `localhost` and wouldn’t be able to reach Qdrant when deleting a RAG or checking collections.

### Why this approach was used
Setting it in `docker-compose` keeps Docker-specific URLs out of your `.env` (which you might use for local runs with `localhost`). So:
- Local: `.env` can omit `QDRANT_URL` → default `localhost:6333`.
- Docker: Compose overrides with `http://qdrant:6333`.

---

## 5. Make Qdrant and Valkey internal-only (no host ports)

### What was changed
- **Qdrant:** Removed the `ports` section (`6333:6333`, `6334:6334`).
- **Valkey:** Removed the `ports` section (`6379:6379`).

So Qdrant and Valkey are **no longer published** to the host. They still run and are reachable only by other containers on the same Docker network (backend, celery_worker).

### Why it was required
You mentioned you’re using the Celery worker now and don’t need Qdrant and Valkey “working independently.” That was interpreted as: you don’t need to access them directly from your machine (e.g. Qdrant dashboard at `localhost:6333` or Redis CLI at `localhost:6379`). The app only needs them to be reachable by backend and worker via service names (`qdrant`, `valkey`).

### Why this approach was used
- **Security:** Qdrant and Valkey are not exposed to the host, so random processes on your PC can’t connect to them.
- **No port clashes:** You avoid conflicts with other tools (e.g. another Redis) using 6379 or 6333 on the host.
- **Same behavior for the app:** Backend and Celery still use `http://qdrant:6333` and `redis://valkey:6379/0`; those use Docker’s internal DNS and don’t depend on published ports.

**Note:** Qdrant and Valkey **services** are still in `docker-compose` and are required. Only their host port mappings were removed. If you later need to access Qdrant UI or Valkey from the host, you can add the `ports` back for that service.

---

## Summary table

| Step | File | Change | Reason |
|------|------|--------|--------|
| 1 | `backend/rag/indexing.py` | QDRANT_URL from env | Containers must use `qdrant:6333`, not localhost |
| 2 | `backend/rag/indexing.py` | Paths via `os.path.basename` / `os.path.splitext` | Works on both Windows and Linux (Docker) |
| 3 | `docker-compose.yml` | Add `celery_worker` service | Someone must run the queued indexing task |
| 4 | `docker-compose.yml` | Backend `QDRANT_URL: http://qdrant:6333` | Backend can reach Qdrant for delete/collections |
| 5 | `docker-compose.yml` | Remove ports from qdrant & valkey | Internal-only; no host exposure needed |

---

## Do you still need Valkey and Qdrant?

- **Valkey (Redis):** Yes. Celery uses it as the message broker. Without Valkey, `task.delay()` has nowhere to send the task and the Celery worker has nothing to consume.
- **Qdrant:** Yes. That’s where document embeddings and vectors are stored. Without Qdrant, indexing and RAG retrieval have nowhere to read/write vectors.

So both services stay in `docker-compose`; only their host port mappings were removed so they are not exposed “independently” to the host.
