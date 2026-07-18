import { KeyRound, MailCheck, ShieldCheck } from "lucide-react";
import { TwoFactorSetup } from "@/components/auth/two-factor-setup";
import { requireAccount } from "@/lib/auth/session";

export default async function SecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ required?: string }>;
}) {
  const account = await requireAccount();
  const params = await searchParams;
  const required =
    account.role === "admin" &&
    (!account.twoFactorEnabled || params.required === "1");

  return (
    <div>
      <p className="text-sm font-medium text-accent-2">Account settings</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em]">
        Security
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Protect access to your private workspace.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <MailCheck className="h-5 w-5 text-emerald-400" />
          <p className="mt-4 text-sm font-medium">Verified email</p>
          <p className="mt-1 truncate text-sm text-zinc-500">
            {account.email}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <KeyRound className="h-5 w-5 text-accent-2" />
          <p className="mt-4 text-sm font-medium">Secure sessions</p>
          <p className="mt-1 text-sm text-zinc-500">
            HttpOnly cookies with 7-day expiration
          </p>
        </div>
      </div>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
        <div className="mb-6 flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">Authenticator app</h2>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              Use time-based one-time passwords and single-use recovery codes.
              {account.role === "admin"
                ? " This is required for administrators."
                : " This is optional but recommended for clients."}
            </p>
          </div>
        </div>
        <TwoFactorSetup
          enabled={account.twoFactorEnabled}
          required={required}
        />
      </section>
    </div>
  );
}
