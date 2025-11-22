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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          
        </div>
        
       {ragData.map((rag,i)=>(
         <RagCard
         key={i}
  rag={rag} 

/>
       ))}

      </div>
    </div>
  );
}
