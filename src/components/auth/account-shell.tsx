"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import type { AccountRole } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

const roleNavigation = {
  admin: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/clients", label: "Clients", icon: Users },
    { href: "/account/security", label: "Security", icon: ShieldCheck },
  ],
  client: [
    { href: "/portal", label: "Workspace", icon: BriefcaseBusiness },
    { href: "/account/security", label: "Security", icon: ShieldCheck },
  ],
};

export function AccountShell({
  role,
  name,
  email,
  children,
}: {
  role: AccountRole;
  name: string;
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  async function signOut() {
    await authClient.signOut();
    window.location.assign("/login");
  }

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="grid-bg absolute inset-0 opacity-35" />
        <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <header className="relative z-20 border-b border-white/10 bg-[#07070a]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-black">
              O
            </span>
            <span className="hidden sm:inline">Omar Husain</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{name}</p>
              <p className="text-xs text-zinc-500">{email}</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium capitalize text-zinc-300">
              {role}
            </span>
            <button
              onClick={() => void signOut()}
              aria-label="Sign out"
              className="grid h-9 w-9 place-items-center rounded-full text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[210px_1fr] lg:py-10">
        <nav className="flex gap-2 overflow-x-auto lg:block lg:space-y-1">
          {roleNavigation[role].map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/admin" &&
                href !== "/portal" &&
                pathname.startsWith(`${href}/`));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  active
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
          <Link
            href="/"
            className="mt-6 hidden items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-500 transition hover:bg-white/[0.05] hover:text-zinc-200 lg:flex"
          >
            <Settings className="h-4 w-4" />
            View website
          </Link>
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
