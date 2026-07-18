"use client";

import { useState } from "react";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function TwoFactorForm() {
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const code = String(form.get("code") ?? "")
      .replace(/\s/g, "")
      .trim();
    const trustDevice = form.get("trustDevice") === "on";

    const result = useBackupCode
      ? await authClient.twoFactor.verifyBackupCode({
          code,
          trustDevice,
        })
      : await authClient.twoFactor.verifyTotp({
          code,
          trustDevice,
        });

    if (result.error) {
      setError(
        result.error.message ??
          "That code was not accepted. Check it and try again."
      );
      setLoading(false);
      return;
    }

    window.location.assign("/dashboard");
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
          {useBackupCode ? "Recovery code" : "6-digit authenticator code"}
        </span>
        <span className="relative block">
          <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            autoFocus
            required
            name="code"
            inputMode={useBackupCode ? "text" : "numeric"}
            autoComplete="one-time-code"
            pattern={useBackupCode ? undefined : "[0-9]{6}"}
            maxLength={useBackupCode ? 32 : 6}
            placeholder={useBackupCode ? "XXXX-XXXX" : "000000"}
            className="w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 font-mono text-lg tracking-[0.24em] outline-none transition focus:border-accent/70 focus:ring-4 focus:ring-accent/10"
          />
        </span>
      </label>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/15 p-4">
        <input
          type="checkbox"
          name="trustDevice"
          className="mt-0.5 h-4 w-4 accent-[#7c5cff]"
        />
        <span>
          <span className="block text-sm font-medium">Trust this device</span>
          <span className="mt-1 block text-xs leading-5 text-zinc-500">
            Skip this step for 30 days. Only use on a private device.
          </span>
        </span>
      </label>

      <button
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ShieldCheck className="h-4 w-4" />
        )}
        {loading ? "Verifying…" : "Verify and continue"}
      </button>

      <button
        type="button"
        onClick={() => {
          setError("");
          setUseBackupCode((current) => !current);
        }}
        className="w-full text-sm text-zinc-400 transition-colors hover:text-white"
      >
        {useBackupCode
          ? "Use an authenticator code"
          : "Use a recovery code instead"}
      </button>
    </form>
  );
}
