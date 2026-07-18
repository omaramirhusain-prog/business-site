import Database from "better-sqlite3";
import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";
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
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "client",
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  rateLimit: {
    enabled: true,
    storage: "database",
  },
  plugins: [
    twoFactor(),
  ],
});
