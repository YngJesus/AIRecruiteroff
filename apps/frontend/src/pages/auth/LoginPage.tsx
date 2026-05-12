import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  AuthShell,
  fieldClass,
  labelClass,
} from "../../components/layout/PageShell";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-8 shadow-2xl shadow-black/40 backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-400/90">
          AIRecruiter
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-400">Sign in to your account</p>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-800/60 bg-rose-950/50 p-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              placeholder="you@company.com"
              required
            />
          </div>

          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClass}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50"
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          No account?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-400 hover:text-blue-300"
          >
            Register
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
