"use client";

import React from "react";
import Link from "next/link";
import { Trash2, MessageSquare, FileText } from "lucide-react";
import api from "@/lib/axios";

type RagCardProps = {
  rag: {
    id: string;
    name: string;
    description: string;
    status: string;
    chunk_size: number;
    chunk_overlap: number;
    embedding_model: string;
    llm_model: string;
    document_count: number;
    top_k: number;
    qdrant_collection: string;
  };
};

async function handleDelete(ragId: string) {
  try {
    const res = await api.delete(`/api/v1/user/delete-rag/${ragId}`);
    if (res) window.location.reload();
  } catch (error) {
    console.error("Error while deleting the rag", error);
  }
}

export default function RagCard({ rag }: RagCardProps) {
  const isCompleted = rag.status === "completed";

  return (
    <div className="group relative max-w-2xl w-full">
      <div className="relative flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/90 px-5 py-4 transition-all duration-300 group-hover:border-zinc-700 group-hover:shadow-lg">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-700/80 bg-zinc-800/80 transition duration-300 group-hover:border-brand/30 group-hover:bg-zinc-800">
              <FileText className="h-4 w-4 text-zinc-400 transition duration-300 group-hover:text-brand" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-white">
                {rag.name}
              </h2>
              <p className="mt-0.5 line-clamp-2 text-sm text-zinc-400">
                {rag.description || "No description"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleDelete(rag.id)}
            className="shrink-0 rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            aria-label="Delete RAG"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Status + stats row */}
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
              isCompleted
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-brand/10 text-brand border border-brand/20"
            }`}
          >
            {rag.status}
          </span>
          <span className="text-xs text-zinc-500">
            {rag.document_count} doc{rag.document_count !== 1 ? "s" : ""} · top-{rag.top_k}
          </span>
          <span className="text-xs text-zinc-600">
            {rag.embedding_model}
          </span>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-zinc-500">
          <span><span className="text-zinc-400">Chunk:</span> {rag.chunk_size}</span>
          <span><span className="text-zinc-400">Overlap:</span> {rag.chunk_overlap}</span>
        </div>

        <div className="border-t border-zinc-800/80" />

        {/* Footer CTA */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">{rag.llm_model}</span>
          <Link
            href={`/chat/${rag.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-brand-foreground transition hover:opacity-90 active:scale-[0.98]"
          >
            <MessageSquare className="h-4 w-4" />
            Open Chat
          </Link>
        </div>
      </div>
    </div>
  );
}
