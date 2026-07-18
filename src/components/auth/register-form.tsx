"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, LockKeyhole, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function RegisterForm({
  email,
  invitationToken,
}: {
  email: string;
  invitationToken: string;
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    const input = {
      email,
      name: String(form.get("name") ?? "").trim(),
      password,
      callbackURL: "/login?status=verified",
      invitationToken,
    };
    const result = await authClient.signUp.email(input);

    if (result.error) {
      setError(
        result.error.message ??
          "We could not create your account. Ask for a new invitation."
      );
      setLoading(false);
      return;
    }

    setComplete(true);
    setLoading(false);
  }

  if (complete) {
    return (
      <div className="py-5 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
        <h2 className="mt-5 text-xl font-semibold">Check your inbox</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          We sent a verification link to{" "}
          <span className="text-zinc-200">{email}</span>. Verify your address,
          then sign in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </div>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-200">
          Full name
        </span>
        <span className="relative block">
          <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            required
            name="name"
            autoComplete="name"
            className="w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-accent/70 focus:ring-4 focus:ring-accent/10"
          />
        </span>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-200">
          Email address
        </span>
        <input
          readOnly
          value={email}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-zinc-400 outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-200">
          Password
        </span>
        <span className="relative block">
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            required
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            className="w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-accent/70 focus:ring-4 focus:ring-accent/10"
          />
        </span>
        <span className="mt-2 block text-xs text-zinc-500">
          Use at least 12 characters.
        </span>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-200">
          Confirm password
        </span>
        <input
          required
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={12}
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm outline-none transition focus:border-accent/70 focus:ring-4 focus:ring-accent/10"
        />
      </label>

      <button
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Creating account…" : "Create client account"}
      </button>
    </form>
  );
}
