import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/password-reset-forms";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token = "", error } = await searchParams;

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Choose a new password"
      description="Your new password must contain at least 12 characters."
    >
      {token && !error ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="text-center">
          <AlertTriangle className="mx-auto h-11 w-11 text-amber-300" />
          <p className="mt-4 text-sm leading-6 text-zinc-400">
            This password reset link is invalid or has expired.
          </p>
          <Link
            href="/forgot-password"
            className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black"
          >
            Request another link
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
