import { AccountShell } from "@/components/auth/account-shell";
import { requireClient } from "@/lib/auth/session";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const account = await requireClient();

  return (
    <AccountShell
      role="client"
      name={account.name}
      email={account.email}
    >
      {children}
    </AccountShell>
  );
}
