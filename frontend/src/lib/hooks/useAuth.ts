
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export function useAuth(redirectTo: string = "/signin") {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const userData = await getCurrentUser();
      
      if (!userData) {
        console.log("❌ Auth failed - redirecting");
        router.push(redirectTo);
      } else { 
        console.log("✅ Auth successful:", userData.email);
        setUser(userData);
      }
      
      setLoading(false);
    }
    
    checkAuth();
  }, [router, redirectTo]);

  return { user, loading };
}