import "server-only";

import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { Pool } from "pg";

declare global {
  var __businessSiteAuthPool: Pool | undefined;
  var __businessSiteAuthSqlite: Database.Database | undefined;
}

export const usesLocalAuthDatabase =
  process.env.AUTH_USE_LOCAL_DB === "true";

function createPostgresPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    ssl:
      process.env.DATABASE_SSL === "false"
        ? false
        : process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : undefined,
  });
}

function getPostgresPool() {
  if (!globalThis.__businessSiteAuthPool) {
    globalThis.__businessSiteAuthPool = createPostgresPool();
  }
  return globalThis.__businessSiteAuthPool;
}

function getSqliteDatabase() {
  if (!globalThis.__businessSiteAuthSqlite) {
    const path =
      process.env.AUTH_LOCAL_DB_PATH ?? "/tmp/business-site-auth.sqlite";
    mkdirSync(dirname(path), { recursive: true });
    globalThis.__businessSiteAuthSqlite = new Database(path);
    globalThis.__businessSiteAuthSqlite.pragma("journal_mode = WAL");
    globalThis.__businessSiteAuthSqlite.pragma("foreign_keys = ON");
  }
  return globalThis.__businessSiteAuthSqlite;
}

export const authDatabase = usesLocalAuthDatabase
  ? getSqliteDatabase()
  : getPostgresPool();

export function getAuthPostgresPool() {
  if (usesLocalAuthDatabase) {
    throw new Error("PostgreSQL is unavailable in local SQLite mode.");
  }
  return getPostgresPool();
}

export function getAuthSqliteDatabase() {
  if (!usesLocalAuthDatabase) {
    throw new Error("SQLite is only available when AUTH_USE_LOCAL_DB=true.");
  }
  return getSqliteDatabase();
}
