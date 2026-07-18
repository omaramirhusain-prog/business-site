import { readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import Database from "better-sqlite3";
import { beforeAll, describe, expect, it } from "vitest";

const databasePath = "/tmp/business-site-auth-test.sqlite";
let invitations: typeof import("@/lib/auth/invitations");

beforeAll(async () => {
  rmSync(databasePath, { force: true });
  const database = new Database(databasePath);
  database.exec(
    readFileSync(
      resolve("database/migrations/001_auth.sqlite.sql"),
      "utf8"
    )
  );
  const now = new Date().toISOString();
  database
    .prepare(
      `INSERT INTO "user"
        (id, name, email, emailVerified, createdAt, updatedAt, role,
         twoFactorEnabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      "admin-1",
      "Admin",
      "admin@example.com",
      1,
      now,
      now,
      "admin",
      1
    );
  database.close();

  invitations = await import("@/lib/auth/invitations");
});

describe("client invitations", () => {
  it("requires the original token and matching email", async () => {
    const invitation = await invitations.createClientInvitation(
      " Client@Example.com ",
      "admin-1"
    );

    expect(invitation.email).toBe("client@example.com");
    await expect(
      invitations.isValidClientInvitation(
        invitation.token,
        "CLIENT@example.com"
      )
    ).resolves.toBe(true);
    await expect(
      invitations.isValidClientInvitation(
        invitation.token,
        "someone@example.com"
      )
    ).resolves.toBe(false);
    await expect(
      invitations.isValidClientInvitation(
        "not-the-token",
        "client@example.com"
      )
    ).resolves.toBe(false);
  });

  it("invalidates an invitation after account creation", async () => {
    const invitation = await invitations.createClientInvitation(
      "second@example.com",
      "admin-1"
    );

    await invitations.markClientInvitationUsed("second@example.com");

    await expect(
      invitations.isValidClientInvitation(
        invitation.token,
        "second@example.com"
      )
    ).resolves.toBe(false);
    const stored = (await invitations.listClientInvitations()).find(
      ({ email }) => email === "second@example.com"
    );
    expect(stored?.usedAt).toBeInstanceOf(Date);
  });
});
