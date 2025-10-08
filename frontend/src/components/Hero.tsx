"use client";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(1000px_600px_at_50%_-10%,rgba(255,120,94,0.15),transparent)]" />
      <p className="mb-6 text-sm text-gray-400">Simplify Learning of your Data structure journey.</p>

      <h1 className="max-w-4xl text-5xl md:text-7xl font-extrabold tracking-tight">
        Manage and simulate <span className="text-rose-400">agentic workflows</span>
      </h1>

      <p className="mt-6 max-w-2xl text-lg text-gray-400">
        Build a retrieval-augmented chat with citations. Create, simulate, and manage AI-driven workflows visually.
      </p>

    {/*   <div className="mt-8 flex gap-4">
        <Link
          href="#chat"
          className="rounded-2xl bg-white text-black px-6 py-3 font-medium hover:bg-gray-100 transition"
        >
          Start building
        </Link>
        <a
          href="https://example.com/pricing"
          className="rounded-2xl border border-gray-700 px-6 py-3 font-medium hover:bg-gray-900 transition"
        >
          View pricing
        </a>
      </div> */}

      <div className="mt-8 flex items-center gap-3 text-sm text-gray-400">
        <Stars /> <span>Innovative AI solution 2025</span> <span>•</span> <span>Trusted by teams</span>
      </div>
    </section>
  );
}

function Stars() {
  return (
    <div className="flex items-center gap-1" aria-label="5 star rating">
      {"★★★★★".split("").map((s, i) => (
        <span key={i} className="text-yellow-400 text-lg leading-none">★</span>
      ))}
    </div>
  );
}
