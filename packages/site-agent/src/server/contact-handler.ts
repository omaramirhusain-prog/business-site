import { NextResponse } from "next/server";
import { Resend } from "resend";

export type ContactEmailInput = {
  name: string;
  email: string;
  message: string;
  source?: string;
};

export type CreateContactHandlerOptions = {
  getFromEmail: () => string;
  getOwnerEmail: () => string;
  getSiteName: () => string;
  getSiteUrl: () => string;
  ownerSubjectPrefix?: string;
};

export function createContactHandler(options: CreateContactHandlerOptions) {
  const ownerPrefix = options.ownerSubjectPrefix ?? "New lead from site:";

  return async function POST(req: Request) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, message: "Contact form is not configured yet." },
        { status: 503 }
      );
    }

    const body = (await req.json()) as Partial<ContactEmailInput>;
    const name = body.name?.trim();
    const email = body.email?.trim();
    const message = body.message?.trim();
    const source = body.source?.trim() ?? "voice/chat assistant";

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, message: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const resend = new Resend(apiKey);
    const from = options.getFromEmail();
    const owner = options.getOwnerEmail();
    const siteName = options.getSiteName();
    const siteUrl = options.getSiteUrl();

    const ownerHtml = `
      <div style="font-family: system-ui, sans-serif; max-width: 520px; color: #111;">
        <h2 style="margin: 0 0 12px;">New project inquiry</h2>
        <p style="margin: 0 0 8px;"><strong>Name:</strong> ${name}</p>
        <p style="margin: 0 0 8px;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 0 0 8px;"><strong>Source:</strong> ${source}</p>
        <p style="margin: 0 0 8px;"><strong>Message:</strong></p>
        <p style="margin: 0; white-space: pre-wrap;">${message}</p>
        <p style="margin: 16px 0 0; color: #666; font-size: 14px;">
          Submitted via ${siteName} — ${siteUrl}
        </p>
      </div>
    `;

    const visitorHtml = `
      <div style="font-family: system-ui, sans-serif; max-width: 520px; color: #111;">
        <h2 style="margin: 0 0 12px;">Thanks for reaching out</h2>
        <p style="margin: 0 0 16px; color: #444;">Hi ${name}, I got your message and will reply soon.</p>
        <p style="margin: 0 0 8px;"><strong>Your note:</strong></p>
        <p style="margin: 0; white-space: pre-wrap; color: #444;">${message}</p>
      </div>
    `;

    try {
      const [visitor, ownerMail] = await Promise.all([
        resend.emails.send({
          from,
          to: email,
          replyTo: owner,
          subject: `Thanks for contacting ${siteName}`,
          html: visitorHtml,
          text: `Hi ${name}, thanks for your message. I'll get back to you soon.`,
        }),
        resend.emails.send({
          from,
          to: owner,
          replyTo: email,
          subject: `${ownerPrefix} ${name}`,
          html: ownerHtml,
          text: `New lead from ${name} (${email}) via ${source}:\n\n${message}`,
        }),
      ]);

      if (visitor.error || ownerMail.error) {
        const detail = visitor.error?.message ?? ownerMail.error?.message;
        return NextResponse.json({
          ok: false,
          message: detail ?? "Could not send your message. Try emailing directly.",
        });
      }

      return NextResponse.json({
        ok: true,
        message: `Thanks ${name}! I sent a confirmation to ${email} and will follow up soon.`,
      });
    } catch (err) {
      return NextResponse.json({
        ok: false,
        message:
          err instanceof Error ? err.message : "Could not send your message.",
      });
    }
  };
}
