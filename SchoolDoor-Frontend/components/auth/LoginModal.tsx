"use client";

import { useState, FormEvent, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      // Reset form when modal closes
      setEmail("");
      setPassword("");
      setFullName("");
      setConfirmPassword("");
      setError(null);
      setIsSignup(false);
      // Restore body scroll
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      // Cleanup on unmount
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/member/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
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

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
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

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 flex min-h-screen items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      style={{ 
        height: '100vh', 
        width: '100vw',
        zIndex: 9999,
        position: 'fixed'
      }}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-surface-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-sd-muted transition hover:bg-sd-soft-pink hover:text-sd-salmon"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sd-salmon">
            SchoolDoor Member
          </p>
          <h2 className="mt-3 font-heading text-2xl text-sd-navy">
            {isSignup ? "Create your account" : "Sign in to continue"}
          </h2>
          <p className="mt-2 text-sm text-sd-muted">
            {isSignup
              ? "Join the SchoolDoor community to share your insights."
              : "Sign in to post reviews and share your experience."}
          </p>
        </div>

        <form
          onSubmit={isSignup ? handleSignup : handleLogin}
          className="space-y-5"
        >
          {isSignup && (
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-semibold uppercase tracking-[0.28em] text-sd-muted"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="mt-2 w-full rounded-xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-[0.28em] text-sd-muted"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="mt-2 w-full rounded-xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-[0.28em] text-sd-muted"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="mt-2 w-full rounded-xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40"
            />
          </div>

          {isSignup && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold uppercase tracking-[0.28em] text-sd-muted"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-2 w-full rounded-xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40"
              />
            </div>
          )}

          {error && <p className="text-sm text-sd-salmon">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex cursor-pointer w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold shadow-surface-sm transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backgroundColor: '#0f9790',
              color: '#ffffff',
              border: 'none'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#0c7e78';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#0f9790';
              }
            }}
          >
            {loading
              ? isSignup
                ? "Creating account…"
                : "Signing in…"
              : isSignup
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-sd-muted">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setIsSignup(false)}
                className="font-semibold text-sd-navy hover:underline"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => setIsSignup(true)}
                className="font-semibold text-sd-navy hover:underline"
              >
                Sign up
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
}



