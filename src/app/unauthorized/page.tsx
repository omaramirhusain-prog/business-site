import Link from "next/link";
import { ShieldX } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";

export default function UnauthorizedPage() {
  return (
    <AuthShell
      eyebrow="Access denied"
      title="This area is restricted"
      description="Your account is valid, but it does not have permission to open this page."
    >
      <div className="text-center">
        <ShieldX className="mx-auto h-12 w-12 text-red-300" />
        <p className="mt-4 text-sm leading-6 text-zinc-400">
          Return to your workspace or contact an administrator if you believe
          your access level is incorrect.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black"
        >
          Go to my workspace
        </Link>
      </div>
    </AuthShell>
  );
}
