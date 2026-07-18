import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  UserRoundPlus,
  Users,
} from "lucide-react";
import { InviteClientForm } from "@/components/auth/invite-client-form";
import { listAccounts } from "@/lib/auth/accounts";
import { listClientInvitations } from "@/lib/auth/invitations";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [accounts, invitations] = await Promise.all([
    listAccounts(),
    listClientInvitations(),
  ]);
  const clients = accounts.filter((account) => account.role === "client");
  const securedAccounts = accounts.filter(
    (account) => account.twoFactorEnabled
  );
  const pendingInvitations = invitations.filter(
    (invitation) =>
      !invitation.usedAt && invitation.expiresAt.getTime() > Date.now()
  );

  const stats = [
    {
      label: "Client accounts",
      value: clients.length,
      icon: Users,
      tone: "text-accent-2 bg-accent-2/10",
    },
    {
      label: "Pending invitations",
      value: pendingInvitations.length,
      icon: Clock3,
      tone: "text-amber-300 bg-amber-300/10",
    },
    {
      label: "2FA protected",
      value: securedAccounts.length,
      icon: ShieldCheck,
      tone: "text-emerald-300 bg-emerald-300/10",
    },
  ];

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-accent-2">Administration</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em]">
            Workspace overview
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Manage secure access for every client project.
          </p>
        </div>
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white"
        >
          View all clients
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"
          >
            <div className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}>
              <Icon className="h-4 w-4" />
            </div>
            <p className="mt-5 text-3xl font-semibold">{value}</p>
            <p className="mt-1 text-sm text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
            <UserRoundPlus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">Invite a client</h2>
            <p className="mt-1 text-sm text-zinc-500">
              The secure registration link expires after seven days.
            </p>
          </div>
        </div>
        <InviteClientForm />
      </section>

      <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
        <div className="border-b border-white/10 px-5 py-4 sm:px-6">
          <h2 className="font-semibold">Recent invitations</h2>
        </div>
        {invitations.length ? (
          <div className="divide-y divide-white/10">
            {invitations.slice(0, 6).map((invitation) => {
              const expired =
                !invitation.usedAt &&
                invitation.expiresAt.getTime() <= Date.now();
              const status = invitation.usedAt
                ? "Accepted"
                : expired
                  ? "Expired"
                  : "Pending";
              return (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {invitation.email}
                    </p>
                    <p className="mt-1 text-xs text-zinc-600">
                      Created{" "}
                      {new Intl.DateTimeFormat("en", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(invitation.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${
                      status === "Accepted"
                        ? "bg-emerald-400/10 text-emerald-300"
                        : status === "Expired"
                          ? "bg-red-400/10 text-red-300"
                          : "bg-amber-300/10 text-amber-200"
                    }`}
                  >
                    {status === "Accepted" ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Clock3 className="h-3 w-3" />
                    )}
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="px-6 py-10 text-center text-sm text-zinc-600">
            No invitations yet.
          </p>
        )}
      </section>
    </div>
  );
}
