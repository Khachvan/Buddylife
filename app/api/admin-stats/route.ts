import { ensureSchema, getSql } from "../../../lib/database";
import { logEvent } from "../../../lib/logging";
import { INTERNAL_SOURCES } from "../../../lib/tracking";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };
// Manual checks on production tag themselves with ?utm_source=internal; they never count.
const INTERNAL_LIST = INTERNAL_SOURCES.map((value) => `'${value}'`).join(", ");
const REAL_EVENTS = `COALESCE(metadata->>'source', '') NOT IN (${INTERNAL_LIST})`;

type Row = Record<string, unknown>;

function rowsOf(value: unknown): Row[] {
  return Array.isArray(value) ? (value as Row[]) : [];
}

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    logEvent("info", "/api/admin-stats", "Query skipped", { error: error instanceof Error ? error.message : "Unknown error" });
    return fallback;
  }
}

export async function GET() {
  try {
    await ensureSchema();
    const sql = getSql();
    const [eventWeeks, registrationWeeks, scanWeeks, sources, languages, articles, totals, scanTotals] = await Promise.all([
      sql.query(`
        SELECT to_char(date_trunc('week', created_at), 'YYYY-MM-DD') AS week, event_type AS "eventType",
               COUNT(DISTINCT COALESCE(metadata->>'sessionId', id::text))::int AS sessions
        FROM analytics_events
        WHERE created_at >= NOW() - INTERVAL '8 weeks' AND ${REAL_EVENTS}
        GROUP BY 1, 2 ORDER BY 1
      `),
      sql.query(`
        SELECT to_char(date_trunc('week', created_at), 'YYYY-MM-DD') AS week, role, COUNT(*)::int AS count
        FROM registrations WHERE created_at >= NOW() - INTERVAL '8 weeks' AND NOT is_test
        GROUP BY 1, 2 ORDER BY 1
      `),
      safe(sql.query(`
        SELECT to_char(date_trunc('week', scanned_at), 'YYYY-MM-DD') AS week, COUNT(*)::int AS count
        FROM qr_scans WHERE scanned_at >= NOW() - INTERVAL '8 weeks' AND NOT is_bot AND NOT is_test
        GROUP BY 1 ORDER BY 1
      `), []),
      sql.query(`
        SELECT COALESCE(NULLIF(metadata->>'source', ''), 'unknown') AS source, event_type AS "eventType",
               COUNT(DISTINCT COALESCE(metadata->>'sessionId', id::text))::int AS sessions
        FROM analytics_events
        WHERE created_at >= NOW() - INTERVAL '30 days' AND ${REAL_EVENTS}
        GROUP BY 1, 2
      `),
      sql.query(`
        SELECT COALESCE(language, 'unknown') AS language, event_type AS "eventType",
               COUNT(DISTINCT COALESCE(metadata->>'sessionId', id::text))::int AS sessions
        FROM analytics_events
        WHERE created_at >= NOW() - INTERVAL '30 days' AND ${REAL_EVENTS}
        GROUP BY 1, 2
      `),
      sql.query(`
        SELECT metadata->>'article' AS article, COUNT(DISTINCT COALESCE(metadata->>'sessionId', id::text))::int AS sessions
        FROM analytics_events
        WHERE event_type = 'view_content' AND created_at >= NOW() - INTERVAL '30 days' AND ${REAL_EVENTS}
          AND COALESCE(metadata->>'article', '') <> ''
        GROUP BY 1 ORDER BY 2 DESC LIMIT 15
      `),
      sql.query(`
        SELECT period, event_type AS "eventType", COUNT(DISTINCT COALESCE(metadata->>'sessionId', id::text))::int AS sessions
        FROM (
          SELECT '7d' AS period, event_type, metadata, id FROM analytics_events WHERE created_at >= NOW() - INTERVAL '7 days' AND ${REAL_EVENTS}
          UNION ALL
          SELECT '30d' AS period, event_type, metadata, id FROM analytics_events WHERE created_at >= NOW() - INTERVAL '30 days' AND ${REAL_EVENTS}
        ) periods
        GROUP BY 1, 2
      `),
      safe(sql.query(`
        SELECT period, COUNT(*)::int AS count FROM (
          SELECT '7d' AS period FROM qr_scans WHERE scanned_at >= NOW() - INTERVAL '7 days' AND NOT is_bot AND NOT is_test
          UNION ALL
          SELECT '30d' AS period FROM qr_scans WHERE scanned_at >= NOW() - INTERVAL '30 days' AND NOT is_bot AND NOT is_test
        ) periods GROUP BY 1
      `), []),
    ]);
    const registrationTotals = await sql.query(`
      SELECT period, role, COUNT(*)::int AS count FROM (
        SELECT '7d' AS period, role FROM registrations WHERE created_at >= NOW() - INTERVAL '7 days' AND NOT is_test
        UNION ALL
        SELECT '30d' AS period, role FROM registrations WHERE created_at >= NOW() - INTERVAL '30 days' AND NOT is_test
      ) periods GROUP BY 1, 2
    `);
    return Response.json(
      {
        generatedAt: new Date().toISOString(),
        eventWeeks: rowsOf(eventWeeks),
        registrationWeeks: rowsOf(registrationWeeks),
        scanWeeks: rowsOf(scanWeeks),
        sources: rowsOf(sources),
        languages: rowsOf(languages),
        articles: rowsOf(articles),
        totals: rowsOf(totals),
        registrationTotals: rowsOf(registrationTotals),
        scanTotals: rowsOf(scanTotals),
      },
      { headers: NO_STORE },
    );
  } catch (error) {
    logEvent("error", "/api/admin-stats", "Stats could not be loaded", { error: error instanceof Error ? error.message : "Unknown error" });
    return Response.json({ error: "Statistics are temporarily unavailable" }, { status: 503, headers: NO_STORE });
  }
}
