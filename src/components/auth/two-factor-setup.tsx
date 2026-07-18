"use client";

import { useState } from "react";
import QRCode from "qrcode";
import {
  Check,
  Clipboard,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

type SetupData = {
  qrCode: string;
  backupCodes: string[];
};

export function TwoFactorSetup({
  enabled,
  required,
}: {
  enabled: boolean;
  required: boolean;
}) {
  const [setup, setSetup] = useState<SetupData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function begin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const result = await authClient.twoFactor.enable({
      password: String(form.get("password") ?? ""),
      issuer: "Omar Husain Portal",
    });

    if (result.error || !result.data) {
      setError(
        result.error?.message ??
          "We could not start two-factor setup. Try again."
      );
      setLoading(false);
      return;
    }

    try {
      const qrCode = await QRCode.toDataURL(result.data.totpURI, {
        width: 240,
        margin: 1,
        color: { dark: "#050507", light: "#ffffff" },
      });
      setSetup({
        qrCode,
        backupCodes: result.data.backupCodes,
      });
    } catch {
      setError("We could not generate the authenticator QR code.");
    } finally {
      setLoading(false);
    }
  }

  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const result = await authClient.twoFactor.verifyTotp({
      code: String(form.get("code") ?? "").trim(),
      trustDevice: true,
    });

    if (result.error) {
      setError(
        result.error.message ??
          "That code was not accepted. Check your authenticator app."
      );
      setLoading(false);
      return;
    }

    window.location.assign("/dashboard");
  }

  async function copyCodes() {
    if (!setup) return;
    await navigator.clipboard.writeText(setup.backupCodes.join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  if (enabled) {
    return (
      <div className="flex items-start gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.07] p-5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-emerald-100">
            Authenticator 2FA is active
          </h3>
          <p className="mt-1 text-sm leading-6 text-emerald-100/60">
            New sign-ins require a rotating code or one of your recovery
            codes.
          </p>
        </div>
      </div>
    );
  }

  if (!setup) {
    return (
      <form onSubmit={begin} className="space-y-5">
        {required ? (
          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm leading-6 text-amber-100">
            Administrators must finish 2FA setup before accessing management
            tools.
          </div>
        ) : null}
        {error ? (
          <div role="alert" className="rounded-2xl bg-red-400/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-zinc-200">
            Confirm your password
          </span>
          <input
            required
            name="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm outline-none focus:border-accent/70 focus:ring-4 focus:ring-accent/10"
          />
        </label>
        <button
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-black disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <KeyRound className="h-4 w-4" />
          )}
          {loading ? "Preparing…" : "Set up authenticator"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verify} className="space-y-6">
      {error ? (
        <div role="alert" className="rounded-2xl bg-red-400/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        {/* The generated data URL contains the user's one-time TOTP secret. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={setup.qrCode}
          alt="Authenticator setup QR code"
          className="mx-auto h-44 w-44 rounded-2xl border-8 border-white bg-white sm:mx-0"
        />
        <div>
          <h3 className="font-semibold">Scan with your authenticator app</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Add this account in 1Password, Google Authenticator, Microsoft
            Authenticator, or another TOTP app.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium">Recovery codes</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Save these once. Each code works only one time.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void copyCodes()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs text-zinc-300"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-300" />
            ) : (
              <Clipboard className="h-3 w-3" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-xs text-zinc-300">
          {setup.backupCodes.map((code) => (
            <span key={code} className="rounded-lg bg-white/[0.05] px-2 py-1.5">
              {code}
            </span>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-200">
          Enter the current 6-digit code
        </span>
        <input
          required
          autoFocus
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="000000"
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 font-mono text-lg tracking-[0.24em] outline-none focus:border-accent/70 focus:ring-4 focus:ring-accent/10"
        />
      </label>
      <button
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-black disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Verifying…" : "Verify and activate 2FA"}
      </button>
    </form>
  );
}
