import { CheckCircle2, Shield, ShieldOff } from "lucide-react";
import { listAccounts } from "@/lib/auth/accounts";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const accounts = (await listAccounts()).filter(
    (account) => account.role === "client"
  );

  return (
    <div>
      <p className="text-sm font-medium text-accent-2">Access management</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em]">
        Client accounts
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Review verified users and their security status.
      </p>

      <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
        {accounts.length ? (
          <div className="divide-y divide-white/10">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex flex-col justify-between gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{account.name}</p>
                  <p className="mt-1 truncate text-sm text-zinc-500">
                    {account.email}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
                      account.emailVerified
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "bg-amber-300/10 text-amber-200"
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {account.emailVerified
                      ? "Email verified"
                      : "Verification pending"}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
                      account.twoFactorEnabled
                        ? "bg-accent/10 text-violet-200"
                        : "bg-white/[0.06] text-zinc-400"
                    }`}
                  >
                    {account.twoFactorEnabled ? (
                      <Shield className="h-3 w-3" />
                    ) : (
                      <ShieldOff className="h-3 w-3" />
                    )}
                    {account.twoFactorEnabled ? "2FA enabled" : "2FA optional"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-6 py-12 text-center text-sm text-zinc-600">
            Invited clients will appear here after registration.
          </p>
        )}
      </section>
    </div>
  );
}
