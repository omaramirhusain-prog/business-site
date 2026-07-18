import "server-only";

import { Resend } from "resend";
import { siteConfig } from "@/lib/site-config";

type AuthEmailKind = "invitation" | "password-reset" | "verification";

const subjects: Record<AuthEmailKind, string> = {
  invitation: `You have been invited to ${siteConfig.name}`,
  "password-reset": "Reset your password",
  verification: "Verify your email address",
};

const headings: Record<AuthEmailKind, string> = {
  invitation: "Your client portal is ready",
  "password-reset": "Reset your password",
  verification: "Verify your email address",
};

const buttonLabels: Record<AuthEmailKind, string> = {
  invitation: "Accept invitation",
  "password-reset": "Reset password",
  verification: "Verify email",
};

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character
  );
}

export async function sendAuthEmail({
  to,
  url,
  kind,
}: {
  to: string;
  url: string;
  kind: AuthEmailKind;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (
      process.env.NODE_ENV !== "production" &&
      process.env.AUTH_DEV_EMAIL_MODE === "console"
    ) {
      console.info(`[auth-email:${kind}] ${to}: ${url}`);
      return;
    }
    throw new Error("RESEND_API_KEY is required to send account emails.");
  }

  const resend = new Resend(apiKey);
  const from =
    process.env.RESEND_FROM_EMAIL ??
    `${siteConfig.name} <onboarding@resend.dev>`;
  const safeUrl = escapeHtml(url);

  const { error } = await resend.emails.send({
    from,
    to,
    subject: subjects[kind],
    html: `
      <div style="background:#050507;padding:40px 20px;font-family:Arial,sans-serif;color:#ededed">
        <div style="max-width:520px;margin:0 auto;border:1px solid #27272a;border-radius:20px;padding:32px;background:#0d0d12">
          <p style="margin:0 0 16px;color:#8b7cff;font-weight:700">OMAR HUSAIN</p>
          <h1 style="font-size:24px;margin:0 0 12px">${headings[kind]}</h1>
          <p style="color:#a1a1aa;line-height:1.6;margin:0 0 24px">
            Use the secure link below. If you did not request this, you can safely ignore this email.
          </p>
          <a href="${safeUrl}" style="display:inline-block;border-radius:999px;padding:12px 20px;background:#fff;color:#050507;text-decoration:none;font-weight:700">
            ${buttonLabels[kind]}
          </a>
          <p style="color:#71717a;font-size:12px;line-height:1.5;margin:24px 0 0;word-break:break-all">${safeUrl}</p>
        </div>
      </div>
    `,
    text: `${headings[kind]}\n\n${url}\n\nIf you did not request this, ignore this email.`,
  });

  if (error) {
    throw new Error(error.message);
  }
}
