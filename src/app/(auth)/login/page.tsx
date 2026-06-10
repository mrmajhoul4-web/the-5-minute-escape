"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/guest", { method: "POST" });
      const data = await res.json();
      await signIn("credentials", {
        email: data.email,
        password: data.guestPassword,
        redirect: false,
      });
      router.push("/");
      router.refresh();
    } catch (e) {
      setError("Failed to create guest session");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Zap className="mx-auto mb-4 h-12 w-12 text-neon-blue" />
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="mt-2 text-dark-100">
            Sign in to continue your streak
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm text-dark-100">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-200" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-dark-600 bg-dark-800 py-3 pl-10 pr-4 text-white outline-none focus:border-neon-blue"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-dark-100">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-200" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-dark-600 bg-dark-800 py-3 pl-10 pr-12 text-white outline-none focus:border-neon-blue"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-200"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple py-3 font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6">
          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full rounded-xl border border-dark-600 py-3 text-sm text-dark-100 transition-colors hover:border-dark-400 hover:text-white"
          >
            Continue as Guest
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-dark-200">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-neon-blue transition-colors hover:underline"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
