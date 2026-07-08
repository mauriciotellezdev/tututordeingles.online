"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Lock, ChevronRight, AlertCircle } from "lucide-react";
import { teacherLoginAction } from "./actions";

export default function TeacherLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Enter the password.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await teacherLoginAction(password);
    setLoading(false);
    if (res.success) {
      router.push("/teacher");
    } else {
      setError(res.error || "Login error.");
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 pt-24 pb-16">
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[100px]" />
      <div className="pointer-events-none absolute right-[-10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[100px]" />

      <div className="animate-fadeIn relative z-10 w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0f1729]/40 p-6 shadow-2xl backdrop-blur-xl md:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-blue-500/10">
            <Lock className="size-5 text-blue-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Teacher Access
          </h1>
          <p className="mt-1 text-xs text-white/40">
            Enter the password to manage the club.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-full border-white/[0.08] bg-[#111827]/40 py-5 text-center text-sm text-white placeholder:text-white/20 focus:border-blue-500/50"
            disabled={loading}
            autoFocus
          />
          <Button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-500 py-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-400"
          >
            {loading ? "Signing in..." : "Sign in"}
            <ChevronRight className="size-4" />
          </Button>
        </form>
      </div>
    </main>
  );
}
