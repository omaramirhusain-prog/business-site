import { redirect } from "next/navigation";
import { requireAccount } from "@/lib/auth/session";
import { dashboardPathForRole } from "@/lib/auth/types";

export default async function DashboardPage() {
  const account = await requireAccount();

  if (account.role === "admin" && !account.twoFactorEnabled) {
    redirect("/account/security?required=1");
  }

  redirect(dashboardPathForRole(account.role));
}
