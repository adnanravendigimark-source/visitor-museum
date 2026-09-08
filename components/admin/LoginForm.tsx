"use client";

import { useState, useEffect, Suspense } from "react";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    onTurnstileVerified?: (token: string) => void;
    onTurnstileExpired?: () => void;
    turnstile?: { reset: (widgetId?: string) => void };
  }
}

function LoginFormFields() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");

  useEffect(() => {
    window.onTurnstileVerified = (token: string) => setCaptchaToken(token);
    window.onTurnstileExpired = () => setCaptchaToken("");
    return () => {
      delete window.onTurnstileVerified;
      delete window.onTurnstileExpired;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setError("Please complete the captcha.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, captchaToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        setLoading(false);
        window.turnstile?.reset();
        setCaptchaToken("");
        return;
      }
      const next = searchParams ? searchParams.get("next") || "/admin" : "/admin";
      router.push(next);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      window.turnstile?.reset();
      setCaptchaToken("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {TURNSTILE_SITE_KEY && (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" async defer />
      )}
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium text-charcoal-700">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-warmstone-300 px-3 py-2.5 text-sm focus:border-olive-700 focus:outline-none focus:ring-1 focus:ring-olive-700"
          autoFocus
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-charcoal-700">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-warmstone-300 px-3 py-2.5 text-sm focus:border-olive-700 focus:outline-none focus:ring-1 focus:ring-olive-700"
          placeholder="••••••••"
        />
      </div>
      {TURNSTILE_SITE_KEY && (
        <div
          className="cf-turnstile"
          data-sitekey={TURNSTILE_SITE_KEY}
          data-callback="onTurnstileVerified"
          data-expired-callback="onTurnstileExpired"
        />
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-olive-700 px-4 py-2.5 text-sm font-semibold text-cream-100 transition hover:bg-olive-800 disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-sm text-sage-600">Loading form...</div>}>
      <LoginFormFields />
    </Suspense>
  );
}
