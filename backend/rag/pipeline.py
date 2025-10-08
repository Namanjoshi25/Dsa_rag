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
QDRANT_COLLECTION  = os.getenv("QDRANT_COLLECTION", "data_structure_vector_store")
EMBEDDING_MODEL    = os.getenv("EMBEDDING_MODEL", "text-embedding-3-large")  # must match your index
CHAT_MODEL         = os.getenv("CHAT_MODEL", "gpt-4o-mini")
TOP_K              = int(os.getenv("TOP_K", "4"))
MAX_CONTEXT_CHARS  = int(os.getenv("MAX_CONTEXT_CHARS", "8000"))  # simple budget

# ---- Clients
openai_client = OpenAI()
emb = OpenAIEmbeddings(model=EMBEDDING_MODEL)

vs = QdrantVectorStore.from_existing_collection(
    collection_name=QDRANT_COLLECTION,
    embedding=emb,
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
)

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
def process_query(query: str) -> Dict:
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
        "You are a Data Structures & Algorithms mentor. "
        "Answer STRICTLY using the provided CONTEXT chunks. "
        "If the answer is not in CONTEXT, say you don't know and suggest what to read next. "
        "When you use a chunk, cite it inline as [1], [2], … matching the chunk numbers. "
        "Prefer Python snippets ≤ 15 lines. "
        "Include 3–5 relevant practice problems only if appropriate; avoid inventing titles. "
        "Never include unrelated or private data.\n\n"
        "Output format:\n\n"
        "📘 Topic: <topic>\n\n"
        "Concept Summary:\n<2–5 sentences grounded in CONTEXT with citations>\n\n"
        "Example (Python):\n<short snippet>\n\n"
        "Practice Problems (3–5):\n1. ...\n2. ...\n3. ...\n\n"
        "Tip:\n<one actionable tip>"
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


"""     
if __name__ =='__main__':
    try:
        user_query= input("Enter your query")
    
        if  not user_query :
            print("Error: input is required.", file=sys.stderr)
            sys.exit(2)
        rc = process_query(user_query)
        sys.exit(rc)   
    except Exception as e:
           print(f"Unhandled error: {e}", file=sys.stderr)
           sys.exit(1)     
    
 """


