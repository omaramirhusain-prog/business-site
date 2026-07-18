import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { AccountRole } from "@/lib/auth/types";

export type CurrentAccount = {
  id: string;
  name: string;
  email: string;
  role: AccountRole;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
};

export const getCurrentAccount = cache(
  async (): Promise<CurrentAccount | null> => {
    const session = await auth.api.getSession({
      headers: await headers(),
      query: { disableCookieCache: true },
    });

    if (!session) return null;

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role === "admin" ? "admin" : "client",
      emailVerified: session.user.emailVerified,
      twoFactorEnabled: Boolean(session.user.twoFactorEnabled),
    };
  }
);

export async function requireAccount() {
  const account = await getCurrentAccount();
  if (!account) redirect("/login");
  return account;
}

export async function requireAdmin({
  allowTwoFactorSetup = false,
}: { allowTwoFactorSetup?: boolean } = {}) {
  const account = await requireAccount();
  if (account.role !== "admin") redirect("/unauthorized");
  if (!allowTwoFactorSetup && !account.twoFactorEnabled) {
    redirect("/account/security?required=1");
  }
  return account;
}

export async function requireClient() {
  const account = await requireAccount();
  if (account.role !== "client") redirect("/admin");
  return account;
}
