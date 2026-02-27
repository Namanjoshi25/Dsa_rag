"use client";

import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";
import { ArrowRight, LayoutDashboard } from "lucide-react";

export function Hero() {
  const { user, loading } = useAuthContext();

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 py-20 text-center overflow-hidden">
      {/* Gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,hsl(192_45%_42%_/_0.14),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_50%,hsl(192_45%_42%_/_0.06),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_20%_80%,hsl(192_45%_42%_/_0.05),transparent)]" />
      </div>

      <p className="mb-4 text-sm font-medium uppercase tracking-widest text-zinc-500">
        RAG-powered workflows
      </p>

      <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
        Manage and simulate{" "}
        <span className="text-brand">
          agentic workflows
        </span>
      </h1>

      <p className="mt-6 max-w-2xl text-lg text-zinc-400">
        Build retrieval-augmented chat with citations. Create, simulate, and manage
        AI-driven workflows in one place.
      </p>

      {/* CTA: Dashboard when logged in, Join now when not */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        {loading ? (
          <div className="h-9 w-32 animate-pulse rounded-lg bg-zinc-800/60" />
        ) : user ? (
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:opacity-90 active:scale-[0.98]"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <Link
            href="/signup"
            className="group inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:opacity-90 active:scale-[0.98]"
          >
            Join now
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
        {user && (
          <Link
            href="/create-rag"
            className="inline-flex items-center rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800/80 hover:text-white"
          >
            Create RAG
          </Link>
        )}
      </div>

      <div className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-500">
        <span className="flex items-center gap-1.5">
          <Stars />
          <span>RAG & agents</span>
        </span>
        <span className="hidden sm:inline text-zinc-600">·</span>
        <span>Trusted by teams</span>
      </div>
    </section>
  );
}

function Stars() {
  return (
    <span className="flex gap-0.5 text-brand/80" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="text-sm leading-none">
          ★
        </span>
      ))}
    </span>
  );
}
