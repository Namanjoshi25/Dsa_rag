

"use client";

import { createContext, ReactNode, useContext } from "react";
import { useAuthStatus } from "@/lib/hooks/useAuthStatus";

type AuthContextType = ReturnType<typeof useAuthStatus>;

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children} : {children:ReactNode}) {
  const auth = useAuthStatus(); // { user, loading, setUser, isAuthenticated }
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
