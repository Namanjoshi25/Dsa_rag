"use client";

import Chat from '@/components/Chat'
import React, { useEffect, useState } from 'react'
import api from '@/lib/axios';
import { RagProps } from '@/app/dashboard/page';
import { useParams } from "next/navigation";

function RagChat() {
  const { rag_id } = useParams(); 
  const [ragData, setRagData] = useState<RagProps>();

  useEffect(() => {
    if (!rag_id) return;

    (async () => {
      try {
        const res = await api.get(`/api/v1/user/get-rag-info/${rag_id}`);
        setRagData(res.data);
      } catch (error) {
        console.error("Error fetching rags:", error);
      }
    })();
  }, [rag_id]);

  return ragData ? (
    <Chat ragData={ragData} />
  ) : (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-transparent" />
        <p className="text-zinc-500">Loading chat…</p>
      </div>
    </div>
  );
}

export default RagChat;
