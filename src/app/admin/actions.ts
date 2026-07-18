"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClientInvitation } from "@/lib/auth/invitations";
import { sendAuthEmail } from "@/lib/auth/email";
import { requireAdmin } from "@/lib/auth/session";
import { siteConfig } from "@/lib/site-config";

export type InviteActionState = {
  status: "idle" | "error" | "success";
  message: string;
  invitationUrl?: string;
};

const inviteSchema = z.object({
  email: z.email(),
});

export async function inviteClient(
  _previous: InviteActionState,
  formData: FormData
): Promise<InviteActionState> {
  const account = await requireAdmin();
  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Enter a valid client email address.",
    };
  }

  const invitation = await createClientInvitation(
    parsed.data.email,
    account.id
  );
  const baseURL =
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    siteConfig.siteUrl;
  const invitationUrl = `${baseURL}/register?token=${encodeURIComponent(
    invitation.token
  )}`;

  try {
    await sendAuthEmail({
      to: invitation.email,
      url: invitationUrl,
      kind: "invitation",
    });
  } catch (error) {
    revalidatePath("/admin");
    return {
      status: "success",
      message:
        error instanceof Error
          ? `Invitation created, but email delivery failed: ${error.message}`
          : "Invitation created, but email delivery failed.",
      invitationUrl,
    };
  }

  revalidatePath("/admin");
  return {
    status: "success",
    message: `Invitation sent to ${invitation.email}.`,
    invitationUrl,
  };
}
