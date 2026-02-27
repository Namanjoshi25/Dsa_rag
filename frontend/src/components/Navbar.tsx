"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import { useAuthContext } from "@/context/AuthContext";
import { LayoutDashboard, Plus, LogOut } from "lucide-react";

export default function NavBar() {
  const { user, loading, setUser } = useAuthContext();
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
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-[#0a0a0b]/95 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0a0a0b]/80">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-1 font-extrabold tracking-tight text-white outline-none ring-zinc-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0b] rounded"
        >
          <span className="text-white/95">agentic</span>
          <span className="text-brand">RAG</span>
        </Link>

        {/* Right side */}
        {loading ? (
          <div className="flex items-center gap-3">
            <div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-800/50" />
            <div className="h-9 w-20 animate-pulse rounded-xl bg-zinc-800/50" />
          </div>
        ) : user ? (
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/create-rag"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800/80 hover:text-white"
            >
              <Plus className="h-4 w-4 opacity-80" />
              <span className="hidden sm:inline">Create RAG</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-lg bg-brand px-2.5 py-1.5 text-sm font-medium text-brand-foreground transition hover:opacity-90"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-700/80 bg-zinc-900/60 px-2.5 py-1.5 text-sm font-medium text-zinc-400 transition hover:border-zinc-600 hover:bg-zinc-800/80 hover:text-zinc-200"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/signin"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800/80 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-2 rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-brand-foreground transition hover:opacity-90 active:scale-[0.98]"
            >
              Join now
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
