import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default function AdminRegistrationPage() {
  return (
    <AuthShell
      eyebrow="Administrator setup"
      title="Create your admin account"
      description="Only an email configured in ADMIN_EMAILS can complete this secure bootstrap flow. Email verification and authenticator 2FA are required."
      footer={
        <>
          Already registered?{" "}
          <Link href="/login" className="text-white hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm accountType="administrator" />
    </AuthShell>
  );
}
