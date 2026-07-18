import "server-only";

import {
  getAuthPostgresPool,
  getAuthSqliteDatabase,
  usesLocalAuthDatabase,
} from "@/lib/auth/database";

export type AccountSummary = {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
};

function toAccount(row: Record<string, unknown>): AccountSummary {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    role: String(row.role ?? "client"),
    emailVerified: Boolean(row.emailVerified),
    twoFactorEnabled: Boolean(row.twoFactorEnabled),
    createdAt: new Date(String(row.createdAt)),
  };
}

export async function listAccounts(limit = 50) {
  if (usesLocalAuthDatabase) {
    const rows = getAuthSqliteDatabase()
      .prepare(
        `SELECT id, name, email, role, emailVerified, twoFactorEnabled, createdAt
         FROM "user"
         ORDER BY createdAt DESC
         LIMIT ?`
      )
      .all(limit) as Record<string, unknown>[];
    return rows.map(toAccount);
  }

  const result = await getAuthPostgresPool().query(
    `SELECT id, name, email, role, "emailVerified", "twoFactorEnabled",
            "createdAt"
     FROM "user"
     ORDER BY "createdAt" DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows.map(toAccount);
}
