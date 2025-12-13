"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import Link from "next/link";

export function MemberSignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/member/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          full_name: fullName.trim() || undefined,
          phone: phone.trim() || undefined,
          bio: bio.trim() || undefined,
          location: location.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(
          typeof data?.error === "string"
            ? data.error
            : "Unable to create account. Please try again.",
        );
        return;
      }

      router.replace("/member/dashboard");
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
          htmlFor="email"
          className="text-xs font-semibold uppercase tracking-[0.24em] text-sd-muted"
        >
          Email *
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-2xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40 focus:ring-2 focus:ring-sd-salmon/40"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-xs font-semibold uppercase tracking-[0.24em] text-sd-muted"
        >
          Password *
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          className="w-full rounded-2xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40 focus:ring-2 focus:ring-sd-salmon/40"
          required
          minLength={6}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="text-xs font-semibold uppercase tracking-[0.24em] text-sd-muted"
        >
          Confirm Password *
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="••••••••"
          className="w-full rounded-2xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40 focus:ring-2 focus:ring-sd-salmon/40"
          required
          minLength={6}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="fullName"
          className="text-xs font-semibold uppercase tracking-[0.24em] text-sd-muted"
        >
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="John Doe"
          className="w-full rounded-2xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40 focus:ring-2 focus:ring-sd-salmon/40"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="phone"
          className="text-xs font-semibold uppercase tracking-[0.24em] text-sd-muted"
        >
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+1 (555) 123-4567"
          className="w-full rounded-2xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40 focus:ring-2 focus:ring-sd-salmon/40"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="location"
          className="text-xs font-semibold uppercase tracking-[0.24em] text-sd-muted"
        >
          Location
        </label>
        <input
          id="location"
          type="text"
          autoComplete="address-level2"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="City, State"
          className="w-full rounded-2xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40 focus:ring-2 focus:ring-sd-salmon/40"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="bio"
          className="text-xs font-semibold uppercase tracking-[0.24em] text-sd-muted"
        >
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          placeholder="Tell us a bit about yourself..."
          rows={3}
          className="w-full rounded-2xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40 focus:ring-2 focus:ring-sd-salmon/40"
        />
      </div>

      {error && <p className="text-sm text-sd-salmon">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center rounded-2xl bg-[#0f9790] px-4 py-3 text-sm font-semibold text-white shadow-surface-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0c7e78] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-sd-muted">
        Already have an account?{" "}
        <Link
          href="/member/login"
          className="font-semibold text-sd-navy hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

