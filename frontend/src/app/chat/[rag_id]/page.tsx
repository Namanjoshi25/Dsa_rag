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

  return <Chat ragData={ragData!}/>;
}

export default RagChat;
