import { neon } from "@neondatabase/serverless";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required to run migrations");

const sql = neon(databaseUrl);
const migrationsDirectory = fileURLToPath(new URL("../drizzle/", import.meta.url));

await sql.query(`
  CREATE TABLE IF NOT EXISTS buddylife_schema_migrations (
    filename TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

const files = (await readdir(migrationsDirectory))
  .filter((filename) => filename.endsWith(".sql"))
  .sort();

for (const filename of files) {
  const applied = await sql`
    SELECT filename FROM buddylife_schema_migrations WHERE filename = ${filename}
  `;
  if (applied.length) continue;

  const migration = await readFile(new URL(`../drizzle/${filename}`, import.meta.url), "utf8");
  const statements = migration
    .split(/;\s*(?:\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
  await sql.transaction((transaction) => [
    ...statements.map((statement) => transaction.query(statement)),
    transaction.query(
      "INSERT INTO buddylife_schema_migrations (filename) VALUES ($1)",
      [filename],
    ),
  ]);
  process.stdout.write(`Applied ${filename}\n`);
}

process.stdout.write("Database migrations are current.\n");
