import { AccountShell } from "@/components/auth/account-shell";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const account = await requireAdmin();

  return (
    <AccountShell
      role="admin"
      name={account.name}
      email={account.email}
    >
      {children}
    </AccountShell>
  );
}
