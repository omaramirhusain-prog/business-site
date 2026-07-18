"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const result = await authClient.requestPasswordReset({
      email: String(form.get("email") ?? ""),
      redirectTo: "/reset-password",
    });

    if (result.error) {
      setError(
        result.error.message ?? "We could not process that request."
      );
      setLoading(false);
      return;
    }

    setComplete(true);
    setLoading(false);
  }

  if (complete) {
    return (
      <div className="py-4 text-center">
        <CheckCircle2 className="mx-auto h-11 w-11 text-emerald-400" />
        <h2 className="mt-4 text-lg font-semibold">Check your inbox</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          If an account exists for that address, a reset link is on its way.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm text-white hover:underline"
        >
          Return to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error ? (
        <div role="alert" className="rounded-2xl bg-red-400/10 p-4 text-sm text-red-200">
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
            name="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-sm outline-none focus:border-accent/70 focus:ring-4 focus:ring-accent/10"
          />
        </span>
      </label>
      <button
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-black disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");

    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    if (result.error) {
      setError(
        result.error.message ??
          "This reset link is invalid or has expired."
      );
      setLoading(false);
      return;
    }

    window.location.assign("/login?status=reset");
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error ? (
        <div role="alert" className="rounded-2xl bg-red-400/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-200">
          New password
        </span>
        <input
          required
          name="password"
          type="password"
          minLength={12}
          autoComplete="new-password"
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm outline-none focus:border-accent/70 focus:ring-4 focus:ring-accent/10"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-200">
          Confirm new password
        </span>
        <input
          required
          name="confirmation"
          type="password"
          minLength={12}
          autoComplete="new-password"
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm outline-none focus:border-accent/70 focus:ring-4 focus:ring-accent/10"
        />
      </label>
      <button
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-black disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
