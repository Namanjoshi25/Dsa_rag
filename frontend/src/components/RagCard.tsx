
import React from "react";
import Link from 'next/link'

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

const gradBorder = "bg-gradient-to-r from-pink-500/30 via-rose-500/30 to-fuchsia-500/30";

export default function RagCard({ rag }: RagCardProps) {
  return (
    <div className="relative group">
      {/* Gradient Border on Hover */}
      <div className={`${gradBorder} absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 blur-md transition duration-500`}></div>

      {/* Card */}
      <div className="relative bg-zinc-900 w-[750px] rounded-2xl border border-zinc-800 px-6 py-5 
        shadow-lg group-hover:shadow-xl transition-all duration-300 hover:-translate-y-1 
        flex flex-col gap-4">
        
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold text-white">{rag.name}</h2>
          <p className="text-sm text-zinc-400">{rag.description}</p>
        </div>

        {/* Status Badge */}
        <span
          className={`px-2 py-1 rounded-md text-xs font-medium w-fit ${
            rag.status === "completed"
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
          }`}
        >
          {rag.status.toUpperCase()}
        </span>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-y-2 text-sm text-zinc-400">
          <p><span className="text-zinc-300">Chunk:</span> {rag.chunk_size}</p>
          <p><span className="text-zinc-300">Overlap:</span> {rag.chunk_overlap}</p>
          <p><span className="text-zinc-300">Docs:</span> {rag.document_count}</p>
          <p><span className="text-zinc-300">Top K:</span> {rag.top_k}</p>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800"></div>

        {/* Footer */}
        <div className="flex justify-between items-center text-xs text-zinc-500">
          <span>{rag.embedding_model}</span>
           <Link href={`/chat/${rag.id}`}
          
            className="px-4 py-2 rounded-xl text-black bg-white hover:bg-zinc-200
              active:scale-[0.97] transition font-medium"
          >
            Open Chat
          </Link>
        </div>
      </div>
    </div>
  );
}
