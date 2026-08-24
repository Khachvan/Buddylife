import { neon } from "@neondatabase/serverless";

let schemaReady: Promise<void> | null = null;

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
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

