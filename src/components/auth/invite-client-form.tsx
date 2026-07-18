"use client";

import { useActionState, useState } from "react";
import { Check, Copy, MailPlus } from "lucide-react";
import {
  inviteClient,
  type InviteActionState,
} from "@/app/admin/actions";

const initialState: InviteActionState = {
  status: "idle",
  message: "",
};

export function InviteClientForm() {
  const [state, action, pending] = useActionState(
    inviteClient,
    initialState
  );
  const [copied, setCopied] = useState(false);

  async function copyInvitation() {
    if (!state.invitationUrl) return;
    await navigator.clipboard.writeText(state.invitationUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <form action={action} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          required
          name="email"
          type="email"
          placeholder="client@company.com"
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none transition focus:border-accent/70 focus:ring-4 focus:ring-accent/10"
        />
        <button
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
        >
          <MailPlus className="h-4 w-4" />
          {pending ? "Creating…" : "Invite client"}
        </button>
      </div>

      {state.message ? (
        <p
          role="status"
          className={
            state.status === "error"
              ? "text-sm text-red-300"
              : "text-sm text-emerald-300"
          }
        >
          {state.message}
        </p>
      ) : null}

      {state.invitationUrl ? (
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 p-2 pl-3">
          <span className="min-w-0 flex-1 truncate font-mono text-xs text-zinc-400">
            {state.invitationUrl}
          </span>
          <button
            type="button"
            onClick={() => void copyInvitation()}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-zinc-300 hover:bg-white/15"
            aria-label="Copy invitation link"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-300" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      ) : null}
    </form>
  );
}
