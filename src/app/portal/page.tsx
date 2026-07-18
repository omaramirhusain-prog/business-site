import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FolderKanban,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import { requireClient } from "@/lib/auth/session";

export default async function ClientPortalPage() {
  const account = await requireClient();

  return (
    <div>
      <p className="text-sm font-medium text-accent-2">Client portal</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em]">
        Welcome, {account.name.split(" ")[0]}
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Your private project workspace is ready.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
                Active project
              </p>
              <h2 className="mt-3 text-xl font-semibold">Project workspace</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Milestones, files, and approvals will appear here when your
                project begins.
              </p>
            </div>
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent/10 text-accent">
              <FolderKanban className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Discovery", icon: CheckCircle2, state: "Complete" },
              { label: "Design", icon: Clock3, state: "Upcoming" },
              { label: "Build", icon: Clock3, state: "Upcoming" },
            ].map(({ label, icon: Icon, state }) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <Icon
                  className={`h-4 w-4 ${
                    state === "Complete"
                      ? "text-emerald-400"
                      : "text-zinc-600"
                  }`}
                />
                <p className="mt-4 text-sm font-medium">{label}</p>
                <p className="mt-1 text-xs text-zinc-600">{state}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          <h2 className="mt-5 font-semibold">Account security</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Email verified. Add authenticator 2FA for stronger protection.
          </p>
          <Link
            href="/account/security"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white"
          >
            Security settings
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </section>
      </div>

      <section className="mt-4 flex flex-col justify-between gap-5 rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-2/10 text-accent-2">
            <MessageSquareText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">Need an update?</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Start a conversation or schedule your next project call.
            </p>
          </div>
        </div>
        <Link
          href="/#contact"
          className="shrink-0 rounded-full bg-white px-5 py-2.5 text-center text-sm font-semibold text-black"
        >
          Contact Omar
        </Link>
      </section>
    </div>
  );
}
