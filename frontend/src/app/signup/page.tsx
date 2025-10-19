"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import{ motion} from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card";

// keep your existing BrandWord, AuthShell, and AuthCard as-is
const BrandWord = ({ children }: { children: React.ReactNode }) => (
<span className="bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">
{children}
</span>
);


// Shared: shell with background + header; centers content
export function AuthShell({ children }: { children: React.ReactNode }) {
return (
<div className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0b] text-white">
{/* Ambient gradient blobs */}
<div className="pointer-events-none absolute -top-48 -left-32 h-[36rem] w-[36rem] rounded-full bg-gradient-to-br from-pink-500/20 via-fuchsia-500/10 to-rose-500/10 blur-3xl" />
<div className="pointer-events-none absolute bottom-[-18rem] right-[-12rem] h-[36rem] w-[36rem] rounded-full bg-gradient-to-tr from-rose-500/20 via-pink-500/10 to-fuchsia-500/10 blur-3xl" />
<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_-10%,rgba(255,255,255,0.08),rgba(10,10,11,0)),radial-gradient(40%_30%_at_120%_10%,rgba(244,114,182,0.08),rgba(10,10,11,0))]" />


<header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
<div className="flex items-center gap-3">
<div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-600 shadow-[0_0_40px_-10px_rgba(244,63,94,0.6)]">
<Sparkles className="h-5 w-5" />
</div>
<span className="text-lg font-semibold tracking-tight">
<BrandWord>agentic</BrandWord>
</span>
</div>
<div className="text-sm text-zinc-400">Innovative AI solution 2025 • Trusted by teams</div>
</header>


<main className="relative z-10 mx-auto flex max-w-xl items-center justify-center px-6 pb-24 pt-6">
{children}
</main>


<footer className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-10 text-xs text-zinc-500">
<div className="flex flex-wrap items-center justify-between gap-3">
<div>© {new Date().getFullYear()} agentic, Inc.</div>
<div className="flex items-center gap-4">
<a href="#" className="hover:text-zinc-300">Status</a>
<a href="#" className="hover:text-zinc-300">Security</a>
<a href="#" className="hover:text-zinc-300">Docs</a>
</div>
</div>
</footer>
</div>
);
}


// Shared: centered card wrapper
function AuthCard({ children, title, subtitle }: { children: React.ReactNode; title: React.ReactNode; subtitle?: string; }) {
return (
<motion.div  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full">
<Card className="w-full overflow-hidden rounded-2xl border-zinc-800/60 bg-zinc-900/60 backdrop-blur-xl">
<CardContent className="p-8">
<h1 className="mb-2 text-center text-3xl font-extrabold">
{title}
</h1>
{subtitle ? (
<p className="mb-6 text-center text-sm text-zinc-400">{subtitle}</p>
) : null}
{children}
</CardContent>
</Card>
</motion.div>
);
}
export default function SignupPage() {
  const router = useRouter();

  // UI + form state
  const [showPwd, setShowPwd] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [agree, setAgree] = React.useState(false);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // basic client-side validation
    if (!name.trim()) return setError("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError("Please enter a valid email.");
    if (password.length < 8)
      return setError("Password must be at least 8 characters.");
    if (!agree)
      return setError("Please accept the Terms and Privacy Policy.");

    try {
      setLoading(true);

      // POST to your API route
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        // expects { message: string } on error
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Could not create account.");
      }

      setSuccess("Account created! Redirecting…");
      router.push("/dashboard"); // change to where you want to land after signup
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <AuthCard
        title={
          <>
            <span>Create your </span>
            <BrandWord>agentic</BrandWord>
            <span> account</span>
          </>
        }
        subtitle="Start building RAG-powered, agentic workflows in minutes."
      >
        {error && (
          <div className="mb-4 rounded-lg border border-rose-700/40 bg-rose-900/20 px-3 py-2 text-sm text-rose-300">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-emerald-700/40 bg-emerald-900/20 px-3 py-2 text-sm text-emerald-300">
            {success}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSignup}>
          <div>
            <Label htmlFor="nameS" className="text-zinc-300">
              Full name
            </Label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 focus-within:border-rose-500/60">
              <User className="h-4 w-4 text-zinc-500" />
              <Input
                id="nameS"
                placeholder="Ada Lovelace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="emailS" className="text-zinc-300">
              Work email
            </Label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 focus-within:border-rose-500/60">
              <Mail className="h-4 w-4 text-zinc-500" />
              <Input
                id="emailS"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="passwordS" className="text-zinc-300">
              Password
            </Label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 focus-within:border-rose-500/60">
              <Lock className="h-4 w-4 text-zinc-500" />
              <Input
                id="passwordS"
                type={showPwd ? "text" : "password"}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="ml-auto rounded-md p-1 text-zinc-400 transition hover:text-white"
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Use 8+ characters with a mix of letters, numbers & symbols.
            </p>
          </div>

          <div className="flex items-start gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-900"
            />
            I agree to the{" "}
            <a className="text-zinc-300 underline-offset-4 hover:underline" href="#">
              Terms
            </a>{" "}
            and{" "}
            <a className="text-zinc-300 underline-offset-4 hover:underline" href="#">
              Privacy Policy
            </a>
            .
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="group w-full rounded-xl bg-gradient-to-r from-rose-500 to-fuchsia-600 shadow-[0_8px_30px_-12px_rgba(244,63,94,0.6)] transition hover:shadow-[0_12px_34px_-12px_rgba(244,63,94,0.9)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating…" : "Create account"}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>

          <p className="text-center text-xs text-zinc-500">
            Already have an account?{" "}
            <a href="/signin" className="text-zinc-300 underline-offset-4 hover:underline">
              Log in
            </a>
          </p>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
