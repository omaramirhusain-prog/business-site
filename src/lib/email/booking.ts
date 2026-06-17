import { Resend } from "resend";
import { getOwnerEmail, siteConfig } from "@/lib/site-config";

export type BookingEmailInput = {
  name: string;
  email: string;
  date: string;
  time: string;
  dateLabel?: string;
  notes?: string;
};

function formatWhen(input: BookingEmailInput) {
  const label = input.dateLabel ?? input.date;
  return `${label} at ${input.time}`;
}

function visitorHtml(input: BookingEmailInput) {
  const when = formatWhen(input);
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 520px; color: #111;">
      <h2 style="margin: 0 0 12px;">You're booked with ${siteConfig.name}</h2>
      <p style="margin: 0 0 16px; color: #444;">Hi ${input.name}, your discovery call is confirmed.</p>
      <p style="margin: 0 0 8px;"><strong>When:</strong> ${when}</p>
      <p style="margin: 0 0 16px;"><strong>With:</strong> ${siteConfig.name}</p>
      <p style="margin: 0; color: #666; font-size: 14px;">
        A calendar invite should arrive separately. Reply to this email if you need to reschedule.
      </p>
    </div>
  `;
}

function ownerHtml(input: BookingEmailInput) {
  const when = formatWhen(input);
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 520px; color: #111;">
      <h2 style="margin: 0 0 12px;">New booking on your site</h2>
      <p style="margin: 0 0 8px;"><strong>Name:</strong> ${input.name}</p>
      <p style="margin: 0 0 8px;"><strong>Email:</strong> ${input.email}</p>
      <p style="margin: 0 0 8px;"><strong>When:</strong> ${when}</p>
      ${input.notes ? `<p style="margin: 0 0 8px;"><strong>Notes:</strong> ${input.notes}</p>` : ""}
      <p style="margin: 16px 0 0; color: #666; font-size: 14px;">
        Booked via the voice/chat assistant on ${siteConfig.siteUrl}
      </p>
    </div>
  `;
}

export async function sendBookingEmails(
  input: BookingEmailInput
): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, error: "RESEND_API_KEY not configured" };
  }

  const resend = new Resend(apiKey);
  const from =
    process.env.RESEND_FROM_EMAIL ??
    `${siteConfig.name} <onboarding@resend.dev>`;
  const owner = getOwnerEmail();
  const when = formatWhen(input);

  try {
    const [visitor, ownerMail] = await Promise.all([
      resend.emails.send({
        from,
        to: input.email,
        replyTo: owner,
        subject: `Discovery call confirmed — ${when}`,
        html: visitorHtml(input),
        text: `Hi ${input.name}, your discovery call with ${siteConfig.name} is confirmed for ${when}.`,
      }),
      resend.emails.send({
        from,
        to: owner,
        replyTo: input.email,
        subject: `New booking: ${input.name} — ${when}`,
        html: ownerHtml(input),
        text: `New booking from ${input.name} (${input.email}) for ${when}.${input.notes ? ` Notes: ${input.notes}` : ""}`,
      }),
    ]);

    if (visitor.error || ownerMail.error) {
      const detail = visitor.error?.message ?? ownerMail.error?.message;
      return { sent: false, error: detail ?? "Resend request failed" };
    }

    return { sent: true };
  } catch (err) {
    return {
      sent: false,
      error: err instanceof Error ? err.message : "Email send failed",
    };
  }
}
