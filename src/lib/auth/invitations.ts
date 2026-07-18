import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import {
  getAuthPostgresPool,
  getAuthSqliteDatabase,
  usesLocalAuthDatabase,
} from "@/lib/auth/database";
import { normalizeEmail } from "@/lib/auth/types";

export type ClientInvitation = {
  id: string;
  email: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function toInvitation(row: Record<string, unknown>): ClientInvitation {
  return {
    id: String(row.id),
    email: String(row.email),
    expiresAt: new Date(String(row.expiresAt)),
    usedAt: row.usedAt ? new Date(String(row.usedAt)) : null,
    createdAt: new Date(String(row.createdAt)),
  };
}

export async function createClientInvitation(
  email: string,
  invitedBy: string
) {
  const id = randomUUID();
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const normalizedEmail = normalizeEmail(email);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  if (usesLocalAuthDatabase) {
    getAuthSqliteDatabase()
      .prepare(
        `INSERT INTO client_invitation
          (id, email, token_hash, invited_by, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        id,
        normalizedEmail,
        tokenHash,
        invitedBy,
        expiresAt.toISOString(),
        new Date().toISOString()
      );
  } else {
    await getAuthPostgresPool().query(
      `INSERT INTO client_invitation
        (id, email, token_hash, invited_by, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, normalizedEmail, tokenHash, invitedBy, expiresAt]
    );
  }

  return { id, email: normalizedEmail, token, expiresAt };
}

export async function findClientInvitationByToken(token: string) {
  const tokenHash = hashToken(token);

  if (usesLocalAuthDatabase) {
    const row = getAuthSqliteDatabase()
      .prepare(
        `SELECT id, email, expires_at AS expiresAt, used_at AS usedAt,
                created_at AS createdAt
         FROM client_invitation
         WHERE token_hash = ?`
      )
      .get(tokenHash) as Record<string, unknown> | undefined;
    return row ? toInvitation(row) : null;
  }

  const result = await getAuthPostgresPool().query(
    `SELECT id, email, expires_at AS "expiresAt", used_at AS "usedAt",
            created_at AS "createdAt"
     FROM client_invitation
     WHERE token_hash = $1`,
    [tokenHash]
  );
  return result.rows[0] ? toInvitation(result.rows[0]) : null;
}

export async function isValidClientInvitation(
  token: string,
  email: string
) {
  const invitation = await findClientInvitationByToken(token);
  return Boolean(
    invitation &&
      !invitation.usedAt &&
      invitation.expiresAt.getTime() > Date.now() &&
      invitation.email === normalizeEmail(email)
  );
}

export async function markClientInvitationUsed(email: string) {
  const normalizedEmail = normalizeEmail(email);

  if (usesLocalAuthDatabase) {
    getAuthSqliteDatabase()
      .prepare(
        `UPDATE client_invitation
         SET used_at = ?
         WHERE email = ? AND used_at IS NULL`
      )
      .run(new Date().toISOString(), normalizedEmail);
    return;
  }

  await getAuthPostgresPool().query(
    `UPDATE client_invitation
     SET used_at = CURRENT_TIMESTAMP
     WHERE email = $1 AND used_at IS NULL`,
    [normalizedEmail]
  );
}

export async function listClientInvitations(limit = 20) {
  if (usesLocalAuthDatabase) {
    const rows = getAuthSqliteDatabase()
      .prepare(
        `SELECT id, email, expires_at AS expiresAt, used_at AS usedAt,
                created_at AS createdAt
         FROM client_invitation
         ORDER BY created_at DESC
         LIMIT ?`
      )
      .all(limit) as Record<string, unknown>[];
    return rows.map(toInvitation);
  }

  const result = await getAuthPostgresPool().query(
    `SELECT id, email, expires_at AS "expiresAt", used_at AS "usedAt",
            created_at AS "createdAt"
     FROM client_invitation
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows.map(toInvitation);
}
