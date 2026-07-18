import Database from "better-sqlite3";
import { betterAuth } from "better-auth";
import { admin, twoFactor } from "better-auth/plugins";
import { Pool } from "pg";

const database =
  process.env.AUTH_SCHEMA_DIALECT === "sqlite"
    ? new Database(":memory:")
    : new Pool({
        connectionString:
          process.env.DATABASE_URL ??
          "postgres://schema:schema@127.0.0.1:5432/schema",
      });

export const auth = betterAuth({
  database,
  emailAndPassword: {
    enabled: true,
  },
  rateLimit: {
    enabled: true,
    storage: "database",
  },
  plugins: [
    admin({
      defaultRole: "client",
      adminRoles: ["admin"],
    }),
    twoFactor(),
  ],
});
