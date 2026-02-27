"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import{ motion} from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
// keep your existing BrandWord, AuthShell, and AuthCard as-is
const BrandWord = ({ children }: { children: React.ReactNode }) => (
<span className="text-brand">
{children}
</span>
);


// Shared: shell with background + header; centers content
export function AuthShell({ children }: { children: React.ReactNode }) {
return (
<div className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0b] text-white">
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
<Card className="w-full overflow-hidden rounded-xl border-zinc-800/60 bg-zinc-900/60 backdrop-blur-xl">
<CardContent className="p-6">
<h1 className="mb-1 text-center text-2xl font-extrabold">
{title}
</h1>
{subtitle ? (
<p className="mb-4 text-center text-sm text-zinc-400">{subtitle}</p>
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

    // POST to your API route using Axios
  try {
    const res = await axios.post(
      'http://localhost:8000/api/v1/auth/signup',
      { full_name: name, email, password }, 
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    

    setSuccess('Account created! Redirecting…');
    router.push('/signin');
  } catch (error : any) {

    let errorMessage = 'Could not create account.';

    if (error.response) {
    
      const data = error.response.data; 
      errorMessage = data?.message || errorMessage;
    } else if (error.request) {
      
      errorMessage = 'No response received from server.';
    } else {
      errorMessage = error.message || errorMessage;
    }


    console.error(errorMessage);
    
    
  
    throw new Error(errorMessage); 

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

        <form className="space-y-4" onSubmit={handleSignup}>
          <div>
            <Label htmlFor="nameS" className="text-zinc-300">
              Full name
            </Label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 focus-within:border-brand/50 focus-within:ring-1 focus-within:ring-brand/20">
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
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 focus-within:border-brand/50 focus-within:ring-1 focus-within:ring-brand/20">
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
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 focus-within:border-brand/50 focus-within:ring-1 focus-within:ring-brand/20">
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
            className="group w-full rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
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
