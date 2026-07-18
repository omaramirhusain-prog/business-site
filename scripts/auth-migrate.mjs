import { readFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import Database from "better-sqlite3";
import pg from "pg";

const root = resolve(import.meta.dirname, "..");
const local = process.env.AUTH_USE_LOCAL_DB === "true";
const filename = local
  ? "001_auth.sqlite.sql"
  : "001_auth.postgres.sql";
const sql = await readFile(
  resolve(root, "database", "migrations", filename),
  "utf8"
);

if (local) {
  const path =
    process.env.AUTH_LOCAL_DB_PATH ?? "/tmp/business-site-auth.sqlite";
  await mkdir(dirname(path), { recursive: true });
  const database = new Database(path);
  database.pragma("foreign_keys = ON");
  database.exec(sql);
  database.close();
  console.log(`Applied ${filename} to ${path}`);
} else {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for PostgreSQL migrations.");
  }
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.DATABASE_SSL === "false"
        ? false
        : { rejectUnauthorized: false },
  });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log(`Applied ${filename}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}
