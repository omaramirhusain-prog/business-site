import Link from "next/link";
import { ArrowLeft, Fingerprint, ShieldCheck } from "lucide-react";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050507] px-4 py-8 text-white sm:px-6 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:p-0">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[10%] h-80 w-80 rounded-full bg-accent/15 blur-[120px]" />
        <div className="absolute bottom-[5%] right-[5%] h-96 w-96 rounded-full bg-accent-2/10 blur-[140px]" />
        <div className="grid-bg absolute inset-0 opacity-60" />
      </div>

      <section className="relative hidden min-h-screen flex-col justify-between border-r border-white/10 p-12 lg:flex xl:p-16">
        <Link
          href="/"
          className="flex w-fit items-center gap-3 font-semibold tracking-tight"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-2 font-bold text-black">
            O
          </span>
          Omar Husain
        </Link>

        <div className="max-w-xl">
          <div className="mb-8 grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-accent-2">
            <Fingerprint className="h-8 w-8" />
          </div>
          <h2 className="text-4xl font-semibold leading-tight tracking-[-0.04em] xl:text-5xl">
            One secure space for every project.
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-8 text-zinc-400">
            Clients follow delivery progress while administrators manage access,
            projects, and conversations.
          </p>
        </div>

        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          Encrypted sessions · Authenticator 2FA · Recovery codes
        </div>
      </section>

      <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center lg:min-h-screen">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to website
          </Link>

          <div className="mb-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-accent-2">
              {eyebrow}
            </p>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 leading-7 text-zinc-400">{description}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
            {children}
          </div>

          {footer ? (
            <div className="mt-6 text-center text-sm text-zinc-500">
              {footer}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
