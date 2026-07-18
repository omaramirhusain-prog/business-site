import { AuthShell } from "@/components/auth/auth-shell";
import { TwoFactorForm } from "@/components/auth/two-factor-form";

export default function TwoFactorVerificationPage() {
  return (
    <AuthShell
      eyebrow="Two-factor authentication"
      title="Confirm it’s you"
      description="Enter the current code from your authenticator app. This extra check protects your workspace even if your password is compromised."
    >
      <TwoFactorForm />
    </AuthShell>
  );
}
