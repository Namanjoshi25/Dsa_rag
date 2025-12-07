// app/components/NavBar.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStatus } from "@/lib/hooks/useAuthStatus";
import { logout } from "@/lib/auth";
import { useAuthContext } from "@/context/AuthContext";

const grad =
  "bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400";

export default function NavBar() {
  const { user, loading, setUser,isAuthenticated } = useAuthContext()
  const router = useRouter();

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      setUser(null);
      router.push("/signin");
    }
  };

  return (
    <nav className="w-full border-b border-zinc-800/60 bg-[#0a0a0b]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0a0a0b]/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="font-extrabold tracking-tight text-white">
          <span className="mr-1">agentic</span>
          <span className={`${grad} bg-clip-text text-transparent`}>RAG</span>
        </Link>

        {/* Right side */}
        {loading ? (
          <div className="h-6 w-40 animate-pulse rounded bg-zinc-800/50" />
        ) : user ? (
          <div className="flex items-center gap-4">
            <Link
              href="/create-rag"
              className="text-sm text-zinc-200 transition hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-400 hover:via-rose-400 hover:to-fuchsia-400"
            >
              Create Rag
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-zinc-200 transition hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-400 hover:via-rose-400 hover:to-fuchsia-400"
            >
              Dashboard
            </Link>
            <button
              onClick={onLogout}
              className="text-sm text-zinc-200 rounded-md border border-zinc-800 px-3 py-1 transition hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-400 hover:via-rose-400 hover:to-fuchsia-400"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/signin"
              className="text-sm text-zinc-200 transition hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-pink-400 hover:via-rose-400 hover:to-fuchsia-400"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm rounded-md  bg-zinc-100/10   px-3 py-1 border border-zinc-800 hover:bg-zinc-100/10 transition hover:text-transparent bg-clip-text bg-gradient-to-r hover:from-pink-400 hover:via-rose-400 hover:to-fuchsia-400"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
