"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(
          typeof data?.error === "string"
            ? data.error
            : "Unable to sign in. Please check your credentials.",
        );
        return;
      }

      router.replace("/portal/dashboard");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="username"
          className="text-xs font-semibold uppercase tracking-[0.24em] text-sd-muted"
        >
          Username
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="admin@schooldoor"
          className="w-full rounded-2xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40 focus:ring-2 focus:ring-sd-salmon/40"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-xs font-semibold uppercase tracking-[0.24em] text-sd-muted"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          className="w-full rounded-2xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40 focus:ring-2 focus:ring-sd-salmon/40"
          required
        />
      </div>

      {error && <p className="text-sm text-sd-salmon">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center rounded-2xl bg-[#0f9790] px-4 py-3 text-sm font-semibold text-white shadow-surface-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0c7e78] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
