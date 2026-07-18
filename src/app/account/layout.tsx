import { AccountShell } from "@/components/auth/account-shell";
import { requireAccount } from "@/lib/auth/session";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const account = await requireAccount();

  return (
    <AccountShell
      role={account.role}
      name={account.name}
      email={account.email}
    >
      {children}
    </AccountShell>
  );
}
