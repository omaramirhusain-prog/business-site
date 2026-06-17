import { Resend } from "resend";
import { getOwnerEmail, siteConfig } from "@/lib/site-config";

export type LeadEmailInput = {
  name: string;
  email: string;
  message: string;
  source?: string;
};

export async function sendLeadEmails(
  input: LeadEmailInput
): Promise<{ sent: boolean; message: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, message: "Contact form is not configured yet." };
  }

  const resend = new Resend(apiKey);
  const from =
    process.env.RESEND_FROM_EMAIL ??
    `${siteConfig.name} <onboarding@resend.dev>`;
  const owner = getOwnerEmail();
  const source = input.source ?? "voice/chat assistant";

  const ownerHtml = `
    <div style="font-family: system-ui, sans-serif; max-width: 520px; color: #111;">
      <h2 style="margin: 0 0 12px;">New project inquiry</h2>
      <p style="margin: 0 0 8px;"><strong>Name:</strong> ${input.name}</p>
      <p style="margin: 0 0 8px;"><strong>Email:</strong> ${input.email}</p>
      <p style="margin: 0 0 8px;"><strong>Source:</strong> ${source}</p>
      <p style="margin: 0 0 8px;"><strong>Message:</strong></p>
      <p style="margin: 0; white-space: pre-wrap;">${input.message}</p>
    </div>
  `;

  try {
    const [visitor, ownerMail] = await Promise.all([
      resend.emails.send({
        from,
        to: input.email,
        replyTo: owner,
        subject: `Thanks for contacting ${siteConfig.name}`,
        html: `<p>Hi ${input.name}, thanks for your message. I'll get back to you soon.</p>`,
        text: `Hi ${input.name}, thanks for your message. I'll get back to you soon.`,
      }),
      resend.emails.send({
        from,
        to: owner,
        replyTo: input.email,
        subject: `New lead from site: ${input.name}`,
        html: ownerHtml,
        text: `New lead from ${input.name} (${input.email}):\n\n${input.message}`,
      }),
    ]);

    if (visitor.error || ownerMail.error) {
      return {
        sent: false,
        message:
          visitor.error?.message ??
          ownerMail.error?.message ??
          "Could not send your message.",
      };
    }

    return {
      sent: true,
      message: `Thanks ${input.name}! I sent a confirmation to ${input.email} and will follow up soon.`,
    };
  } catch (err) {
    return {
      sent: false,
      message: err instanceof Error ? err.message : "Could not send your message.",
    };
  }
}
