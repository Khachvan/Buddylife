import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Sql } from "./database";

const MIGRATIONS_DIR = path.join(process.cwd(), "drizzle");

export type MigrationStatus = {
  files: Array<{ filename: string; appliedAt: string | null }>;
  pending: string[];
};

export async function listMigrationFiles() {
  return (await readdir(MIGRATIONS_DIR)).filter((filename) => filename.endsWith(".sql")).sort();
}

export function splitStatements(migration: string) {
  return migration
    .split(/;\s*(?:\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function ensureMigrationTable(sql: Sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS buddylife_schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function getMigrationStatus(sql: Sql): Promise<MigrationStatus> {
  await ensureMigrationTable(sql);
  const files = await listMigrationFiles();
  const rows = await sql`SELECT filename, applied_at AS "appliedAt" FROM buddylife_schema_migrations`;
  const applied = new Map(rows.map((row) => [String(row.filename), new Date(row.appliedAt as string).toISOString()]));
  return {
    files: files.map((filename) => ({ filename, appliedAt: applied.get(filename) ?? null })),
    pending: files.filter((filename) => !applied.has(filename)),
  };
}

/** Applies every pending migration in order, each inside its own transaction. */
export async function applyPendingMigrations(sql: Sql, options: { localEngine?: boolean } = {}) {
  const status = await getMigrationStatus(sql);
  const applied: string[] = [];
  for (const filename of status.pending) {
    const migration = await readFile(path.join(MIGRATIONS_DIR, filename), "utf8");
    const statements = splitStatements(migration).filter(
      // PGlite ships without pgcrypto; gen_random_uuid() is built into Postgres 13+ anyway.
      (statement) => !(options.localEngine && /^CREATE EXTENSION/i.test(statement)),
    );
    await sql.transaction((transaction) => [
      ...statements.map((statement) => transaction.query(statement)),
      transaction.query("INSERT INTO buddylife_schema_migrations (filename) VALUES ($1)", [filename]),
    ]);
    applied.push(filename);
  }
  return applied;
}
