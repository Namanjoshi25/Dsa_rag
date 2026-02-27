"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { logout } from "@/lib/auth";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import RagCard from "@/components/RagCard";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  email: string;
  full_name: string;
};
export  type RagProps = {
  user_id: string;
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
 
}
export default function Dashboard() {
  const { user, loading } = useAuth() as { user: User | null; loading: boolean };
  const [ragData, setRagData] = useState<RagProps[]>([]);
  const router = useRouter()
  useEffect(() => {
    if (!user?.id) return; // Prevent API call until user.id is defined

    (async () => {
      try {
        const res = await api.get(`/api/v1/user/get-user-rags/${user.id}`);
        setRagData(res.data)
      } catch (error) {
        console.error("Error fetching rags:", error);
      }
    })();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-brand" />
          <span className="text-sm text-zinc-400">Loading…</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-1 text-xl font-bold tracking-tight text-white sm:text-2xl">Dashboard</h1>
        <p className="mb-6 text-sm text-zinc-400">Your RAG collections</p>

        <div className="flex flex-col gap-5">
          {ragData.map((rag) => (
            <RagCard key={rag.id} rag={rag} />
          ))}
        </div>

        {ragData.length === 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-10 text-center">
            <p className="text-sm text-zinc-500">No RAGs yet.</p>
            <p className="mt-1 text-xs text-zinc-600">Create one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
