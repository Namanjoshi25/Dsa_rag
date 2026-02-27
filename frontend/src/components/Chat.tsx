"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Square } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
import { RagProps } from "@/app/dashboard/page";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  email: string;
  full_name: string;
};

export default function Chat({ ragData }: { ragData: RagProps | undefined }) {
  const [q, setQ] = useState("");
  const [ans, setAns] = useState("");
  const [loading, setLoading] = useState(false);
  const answerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const { user } = useAuth() as { user: User | null; loading: boolean };
  const router = useRouter();



  useEffect(() => {
    if (answerRef.current && ans) {
      answerRef.current.scrollTop = answerRef.current.scrollHeight;
    }
  }, [ans]);

  async function ask() {
    if (!q.trim() || !ragData) return;
    setAns("");
    setLoading(true);
    const ctrl = new AbortController();
    controllerRef.current = ctrl;

    try {
      const res = await fetch(`${API_BASE}/api/v1/rag/ask/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: q,
          collection_name: ragData.qdrant_collection,
          embedding: ragData.embedding_model,
        }),
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
        if (done) {
          setAns((prev) => prev + decoder.decode());
          break;
        }
        setAns((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (e: unknown) {
      const err = e as { name?: string; message?: string };
      if (err.name !== "AbortError") setAns(`Error: ${err.message ?? String(e)}`);
    } finally {
      setLoading(false);
      controllerRef.current = null;
    }
  }

  function stop() {
    controllerRef.current?.abort();
    setLoading(false);
  }

  if (!user) return null;
  if (!ragData) return null;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-800/80 bg-[#0a0a0b]/95 backdrop-blur-md supports-[backdrop-filter]:bg-[#0a0a0b]/80">
        <div className="relative mx-auto flex max-w-3xl items-center gap-3 px-4 py-2.5 sm:px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 text-sm text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800/80 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <div className="min-w-0 flex-1 border-l border-zinc-800 pl-3">
            <h1 className="truncate text-sm font-semibold text-white sm:text-base">
              {ragData.name}
            </h1>
            <p className="mt-0.5 truncate text-xs text-zinc-500">
              {ragData.description || "RAG Chat"}
            </p>
          </div>
        </div>
      </header>

      {/* Chat area */}
      <section className="flex flex-1 flex-col px-4 pb-6 pt-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
          <div
            ref={answerRef}
            className="mb-3 min-h-[160px] flex-1 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-3"
          >
            <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-200">
              {ans || (
                <span className="text-zinc-500">Ask a question about your documents. The answer will appear here.</span>
              )}
            </pre>
          </div>

          <div className="flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && ask()}
              placeholder="Ask anything…"
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-zinc-600 focus:ring-2 focus:ring-zinc-700/50"
              disabled={loading}
            />
            <button
              onClick={loading ? stop : ask}
              disabled={!q.trim()}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${
                loading
                  ? "border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  : "bg-brand text-brand-foreground hover:opacity-90 active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <>
                  <Square className="h-4 w-4" />
                  Stop
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Ask
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
