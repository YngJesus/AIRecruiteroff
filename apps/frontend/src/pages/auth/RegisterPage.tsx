import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  AuthShell,
  fieldClass,
  labelClass,
} from "../../components/layout/PageShell";

export function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "recruiter" as "recruiter" | "tech_lead",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.role,
      );
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
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
        <h1 className="mt-2 text-2xl font-bold text-white">Create account</h1>
        <p className="mt-1 text-sm text-slate-400">
          Recruiter or tech lead — admins are invited separately.
        </p>

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
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={fieldClass}
              placeholder="you@company.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>First name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={fieldClass}
                placeholder="Jane"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Last name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={fieldClass}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={fieldClass}
              placeholder="Strong password"
              required
            />
          </div>

          <div>
            <label className={labelClass}>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={fieldClass}
            >
              <option value="recruiter">Recruiter</option>
              <option value="tech_lead">Tech lead</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50"
          >
            {isLoading ? "Creating account…" : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-400 hover:text-blue-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
