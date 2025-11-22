import os, time
from typing import List, Dict
from dotenv import load_dotenv
from openai import OpenAI, APIError, RateLimitError, APITimeoutError
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
import sys

load_dotenv()

# ---- Config
QDRANT_URL         = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY     = os.getenv("QDRANT_API_KEY")  # optional

CHAT_MODEL         = os.getenv("CHAT_MODEL", "gpt-4o-mini")
TOP_K              = int(os.getenv("TOP_K", "4"))
MAX_CONTEXT_CHARS  = int(os.getenv("MAX_CONTEXT_CHARS", "8000"))  # simple budget

# ---- Clients
openai_client = OpenAI()
def _build_context(results) -> tuple[str, List[Dict]]:
    """Build a readable context block and collect citations metadata."""
    parts, citations = [], []
    for i, d in enumerate(results, 1):
        m = d.metadata or {}
        page = m.get("page_label") or m.get("page") or m.get("page_number") or "?"
        src  = m.get("source") or m.get("file") or m.get("path") or "?"
        parts.append(f"Chunk {i} — page {page} — {src}\n{d.page_content}")
        citations.append({"chunk": i, "page": page, "source": src})
    context = "\n\n---\n\n".join(parts)

    # crude budget to avoid gigantic prompts
    if len(context) > MAX_CONTEXT_CHARS:
        context = context[:MAX_CONTEXT_CHARS] + "\n\n... [truncated]"
    return context, citations

def _chat_with_retry(messages, max_retries=3, timeout=60):
    for attempt in range(1, max_retries + 1):
        try:
            return openai_client.chat.completions.create(
                model=CHAT_MODEL,
                temperature=0.2,
                messages=messages,
                timeout=timeout,
            )
        except (RateLimitError, APITimeoutError, APIError) as e:
            if attempt == max_retries:
                raise
            time.sleep(min(2 ** attempt, 10))  # exponential backoff
def process_query(query: str,collection_name:str,embedding:str) -> Dict:
    
    emb = OpenAIEmbeddings(model=embedding)

    vs = QdrantVectorStore.from_existing_collection(
      collection_name=collection_name,
      embedding=emb,
       url=QDRANT_URL,
       api_key=QDRANT_API_KEY,
)

    results = vs.similarity_search(query=query, k=TOP_K)

    if not results:
        return {
            "answer": (
                "I don't know based on the provided documents. "
                "Try broadening the query or indexing more sources on this topic."
            ),
            "citations": [],
            "used_k": 0,
        }

    context, citations = _build_context(results)  # your existing helper (numbered chunks)

    system_msg = (
        "You are a rag agnet .Replay based on information u get ."
    )

    messages = [
        {"role": "system", "content": system_msg},
        {
            "role": "user",
            "content": f"CONTEXT (numbered chunks):\n{context}\n\nQUESTION:\n{query}"
        },
    ]

    resp = _chat_with_retry(messages)
    answer = resp.choices[0].message.content.strip()

    # Optional: post-check – if no [n] citations appear, downrank/flag
    if "[" not in answer:
        answer = (
            "I don't know based on the provided documents. "
            "Consider adding more relevant material or refining the query."
        )
        return {"answer": answer, "citations": citations, "used_k": len(results)}

    return {"answer": answer}



