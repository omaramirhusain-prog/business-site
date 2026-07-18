"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, LockKeyhole, Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";

function safeReturnTo(value: string) {
  return value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";
}

export function LoginForm({
  returnTo = "/dashboard",
  notice,
}: {
  returnTo?: string;
  notice?: string;
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const result = await authClient.signIn.email({
      email,
      password,
      rememberMe: true,
      callbackURL: safeReturnTo(returnTo),
    });

    if (result.error) {
      setError(
        result.error.message ??
          "We could not sign you in. Check your details and try again."
      );
      setLoading(false);
      return;
    }

    if (
      (result.data as { twoFactorRedirect?: boolean } | null)
        ?.twoFactorRedirect
    ) {
      return;
    }

    window.location.assign(safeReturnTo(returnTo));
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {notice ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm leading-6 text-emerald-200">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-200"
        >
          {error}
        </div>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-200">
          Email address
        </span>
        <span className="relative block">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            required
            autoComplete="email"
            name="email"
            type="email"
            placeholder="you@company.com"
            className="w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-accent/70 focus:ring-4 focus:ring-accent/10"
          />
        </span>
      </label>

      <label className="block">
        <span className="mb-2 flex items-center justify-between text-sm font-medium text-zinc-200">
          Password
          <Link
            href="/forgot-password"
            className="font-normal text-zinc-400 transition-colors hover:text-white"
          >
            Forgot password?
          </Link>
        </span>
        <span className="relative block">
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            required
            autoComplete="current-password"
            name="password"
            type="password"
            minLength={12}
            className="w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-accent/70 focus:ring-4 focus:ring-accent/10"
          />
        </span>
      </label>

      <button
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
        {loading ? "Signing in…" : "Continue securely"}
      </button>
    </form>
  );
}
