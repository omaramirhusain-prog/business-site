import { createContactHandler } from "@ais-os/site-agent/server";
import { siteConfig, getOwnerEmail } from "@/lib/site-config";

export const POST = createContactHandler({
  getFromEmail: () =>
    process.env.RESEND_FROM_EMAIL ??
    `${siteConfig.name} <onboarding@resend.dev>`,
  getOwnerEmail,
  getSiteName: () => siteConfig.name,
  getSiteUrl: () => siteConfig.siteUrl,
  ownerSubjectPrefix: "New lead from site:",
});
