export const accountRoles = ["admin", "client"] as const;

export type AccountRole = (typeof accountRoles)[number];

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getAdminEmails(value = process.env.ADMIN_EMAILS) {
  return new Set(
    (value ?? "")
      .split(",")
      .map(normalizeEmail)
      .filter(Boolean)
  );
}

export function roleForEmail(
  email: string,
  adminEmails = getAdminEmails()
): AccountRole {
  return adminEmails.has(normalizeEmail(email)) ? "admin" : "client";
}

export function dashboardPathForRole(role?: string | null) {
  return role === "admin" ? "/admin" : "/portal";
}
