import { describe, expect, it } from "vitest";
import {
  dashboardPathForRole,
  getAdminEmails,
  normalizeEmail,
  roleForEmail,
} from "@/lib/auth/types";

describe("account roles", () => {
  it("normalizes and parses administrator email addresses", () => {
    expect(normalizeEmail("  Admin@Example.COM ")).toBe("admin@example.com");
    expect(
      [...getAdminEmails("one@example.com, TWO@example.com,")]
    ).toEqual(["one@example.com", "two@example.com"]);
  });

  it("never lets an unlisted email choose the administrator role", () => {
    const allowlist = getAdminEmails("owner@example.com");

    expect(roleForEmail("OWNER@example.com", allowlist)).toBe("admin");
    expect(roleForEmail("client@example.com", allowlist)).toBe("client");
  });

  it("routes each role to its own protected workspace", () => {
    expect(dashboardPathForRole("admin")).toBe("/admin");
    expect(dashboardPathForRole("client")).toBe("/portal");
    expect(dashboardPathForRole(undefined)).toBe("/portal");
  });
});
