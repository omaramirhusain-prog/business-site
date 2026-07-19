/**
 * Public site identity — safe for client components.
 * Override via NEXT_PUBLIC_* env vars on Vercel.
 */
export const siteConfig = {
  name: "Northline Detail Co.",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@northlinedetail.co",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://northlinedetail.co",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
  phone: process.env.NEXT_PUBLIC_PHONE ?? "(512) 555-0187",
  address: process.env.NEXT_PUBLIC_ADDRESS ?? "4107 Metric Blvd, Austin, TX",
} as const;

/** Server-only owner inbox for lead / booking notifications. */
export function getOwnerEmail() {
  return (
    process.env.OWNER_EMAIL ??
    process.env.CONTACT_EMAIL ??
    siteConfig.email
  );
}
