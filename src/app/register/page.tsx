import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { findClientInvitationByToken } from "@/lib/auth/invitations";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  const invitation = token
    ? await findClientInvitationByToken(token)
    : null;
  const valid =
    invitation &&
    !invitation.usedAt &&
    invitation.expiresAt.getTime() > Date.now();

  if (!valid) {
    return (
      <AuthShell
        eyebrow="Invitation required"
        title="This link is no longer valid"
        description="Client accounts can only be created from an active invitation."
      >
        <div className="text-center">
          <AlertTriangle className="mx-auto h-11 w-11 text-amber-300" />
          <p className="mt-4 text-sm leading-6 text-zinc-400">
            The invitation may have expired or already been used. Ask your
            administrator to send a new one.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black"
          >
            Return to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Client invitation"
      title="Create your workspace"
      description="Set up your private client account. You will verify your email before the first sign-in."
    >
      <RegisterForm
        email={invitation.email}
        invitationToken={token}
      />
    </AuthShell>
  );
}
