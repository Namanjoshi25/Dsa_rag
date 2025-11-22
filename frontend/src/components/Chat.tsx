"use client";
import { useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
import { RagProps } from "@/app/dashboard/page";

export default function Chat({ragData} : {ragData : RagProps}) {
  const [q, setQ] = useState("");
  const [ans, setAns] = useState("");
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  async function ask() {
    if (!q.trim()) return;
    setAns("");
    setLoading(true);
    const ctrl = new AbortController();
    controllerRef.current = ctrl;

    try {
      const res = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q ,collection_name : ragData.qdrant_collection , embedding : ragData.embedding_model }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) {
        setAns(`Error: ${res.status} ${res.statusText}`);
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        setAns((prev) => prev + decoder.decode(value));
      }
    } catch (e: any) {
      if (e.name !== "AbortError") setAns(`Error: ${e.message ?? e}`);
    } finally {
      setLoading(false);
      controllerRef.current = null;
    }
  }

  function stop() {
    controllerRef.current?.abort();
    setLoading(false);
  }

  return (
    <section id="chat" className="px-6 pb-24">
      <div className="mx-auto max-w-3xl rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-900/40 to-black p-6">
        <h2 className="text-xl font-semibold mb-4">RAG Chat</h2>
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
            placeholder="Ask anything…"
            className="flex-1 rounded-xl bg-black/50 border border-gray-800 px-4 py-3 outline-none focus:border-gray-600"
          />
          <button
            onClick={loading ? stop : ask}
            disabled={!q.trim()}
            className={`rounded-xl px-5 py-3 font-medium transition ${
              loading
                ? "bg-gray-900 border border-gray-700"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            {loading ? "Stop" : "Ask"}
          </button>
        </div>

        <div className="mt-4 rounded-xl bg-black/40 border border-gray-800 p-4 overflow-x-auto min-h-[140px]">
          <pre className="whitespace-pre-wrap text-gray-200">{ans || "Answer will appear here…"}</pre>
        </div>
      </div>
    </section>
  );
}
