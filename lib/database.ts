import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { createLocalSql } from "./database-local";

export type Sql = NeonQueryFunction<false, false>;

let schemaReady: Promise<void> | null = null;
let localSql: Sql | null = null;

const LOCAL_PREFIX = "pglite:";

export function isLocalDatabase() {
  return (process.env.DATABASE_URL || "").startsWith(LOCAL_PREFIX);
}

/** Host name of the configured database, never the credentials. */
export function databaseHost() {
  const url = process.env.DATABASE_URL || "";
  if (!url) return null;
  if (url.startsWith(LOCAL_PREFIX)) return "PGlite (local development engine)";
  try {
    return new URL(url).hostname;
  } catch {
    return "unrecognised connection string";
  }
}

export function getSql(): Sql {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  if (url.startsWith(LOCAL_PREFIX)) {
    if (!localSql) localSql = createLocalSql(url.slice(LOCAL_PREFIX.length)) as unknown as Sql;
    return localSql;
  }
  return neon(url);
}

export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = getSql();
      await sql`
        CREATE TABLE IF NOT EXISTS registrations (
          id UUID PRIMARY KEY,
          role TEXT NOT NULL CHECK (role IN ('parent', 'business')),
          name TEXT,
          pet_type TEXT,
          business_name TEXT,
          category TEXT,
          social TEXT,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          city TEXT,
          province TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS registrations_role_created_idx ON registrations (role, created_at DESC)`;
      await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS source TEXT`;
      await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS medium TEXT`;
      await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS campaign TEXT`;
      await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS venue TEXT`;
      await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT FALSE`;
      await sql`
        CREATE TABLE IF NOT EXISTS analytics_events (
          id UUID PRIMARY KEY,
          event_type TEXT NOT NULL,
          page TEXT,
          language TEXT,
          audience TEXT,
          metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS analytics_events_type_created_idx ON analytics_events (event_type, created_at DESC)`;
      await sql`
        CREATE TABLE IF NOT EXISTS cms_content (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL DEFAULT '',
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}
