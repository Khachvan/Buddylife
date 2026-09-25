import { databaseHost, getSql, isLocalDatabase } from "../../../lib/database";
import { logEvent } from "../../../lib/logging";
import { applyPendingMigrations, getMigrationStatus } from "../../../lib/migrations";
import { hasSameOrigin } from "../../../lib/request-security";

const NO_STORE = { "Cache-Control": "no-store" };
const TABLES = ["registrations", "analytics_events", "cms_content", "qr_codes", "qr_placements", "qr_assignments", "qr_scans", "cms_posts", "cms_media"] as const;

export async function GET() {
  const environment = process.env.VERCEL_ENV || (isLocalDatabase() ? "local" : "unknown");
  const host = databaseHost();
  if (!host) return Response.json({ error: "DATABASE_URL is not configured for this environment" }, { status: 503, headers: NO_STORE });
  try {
    const sql = getSql();
    const [migrations, versionRows] = await Promise.all([getMigrationStatus(sql), sql`SELECT version() AS version`]);
    const tables = await Promise.all(
      TABLES.map(async (table) => {
        const exists = await sql.query(`SELECT to_regclass($1) IS NOT NULL AS present`, [`public.${table}`]);
        if (!exists[0]?.present) return { table, present: false, rows: null };
        const count = await sql.query(`SELECT COUNT(*)::int AS total FROM ${table}`);
        return { table, present: true, rows: Number(count[0]?.total ?? 0) };
      }),
    );
    return Response.json(
      {
        environment,
        host,
        engine: String(versionRows[0]?.version || "").split(" on ")[0],
        migrations,
        tables,
        managedIn: {
          vercelStorage: "https://vercel.com/pet18/buddylife-landing/stores",
          vercelEnv: "https://vercel.com/pet18/buddylife-landing/settings/environment-variables",
          neonConsole: "https://console.neon.tech",
        },
      },
      { headers: NO_STORE },
    );
  } catch (error) {
    logEvent("error", "/api/admin-database", "Database status failed", { error: error instanceof Error ? error.message : "Unknown error" });
    return Response.json({ error: "The database could not be reached" }, { status: 503, headers: NO_STORE });
  }
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  try {
    const body = await request.json();
    if (String(body.action || "") !== "migrate") return Response.json({ error: "Unsupported database action" }, { status: 400 });
    const applied = await applyPendingMigrations(getSql(), { localEngine: isLocalDatabase() });
    logEvent("info", "/api/admin-database", "Migrations applied", { applied });
    return Response.json({ ok: true, applied });
  } catch (error) {
    logEvent("error", "/api/admin-database", "Migration failed", { error: error instanceof Error ? error.message : "Unknown error" });
    return Response.json({ error: "Migration failed; the database was left unchanged for the failing file" }, { status: 503 });
  }
}
