// hooks/useAuthStatus.ts
"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";

export function useAuthStatus() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await getCurrentUser();
        if (!cancelled) setUser(u || null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { user, loading, setUser , isAuthenticated:!!user};
}
