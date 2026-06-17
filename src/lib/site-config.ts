/**
 * Public site identity — safe for client components.
 * Override via NEXT_PUBLIC_* env vars on Vercel.
 */
export const siteConfig = {
  name: "Omar Husain",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "omar.oi.web@gmail.com",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://omar-web-five.vercel.app",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
} as const;

/** Server-only owner inbox for lead / booking notifications. */
export function getOwnerEmail() {
  return (
    process.env.OWNER_EMAIL ??
    process.env.CONTACT_EMAIL ??
    siteConfig.email
  );
}
