import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

const notices: Record<string, string> = {
  reset: "Your password has been updated. You can sign in now.",
  verified: "Your email is verified. Sign in to continue.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    returnTo?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      eyebrow="Secure access"
      title="Welcome back"
      description="Sign in to reach your private workspace. Administrators with 2FA enabled will verify their authenticator code next."
      footer={
        <>
          Need an account? Client access is{" "}
          <span className="text-zinc-300">invitation only</span>.{" "}
          <Link href="/#contact" className="text-white hover:underline">
            Contact Omar
          </Link>
        </>
      }
    >
      <LoginForm
        returnTo={params.returnTo}
        notice={params.status ? notices[params.status] : undefined}
      />
    </AuthShell>
  );
}
