import { ensureSchema, getSql } from "../../../../../lib/database";
import { logEvent } from "../../../../../lib/logging";
import { isUuid } from "../../../../../lib/qr-attribution";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

const responseHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isUuid(id)) {
    return Response.json({ error: "Invalid QR identity" }, { status: 400, headers: responseHeaders });
  }

  try {
    await ensureSchema();
    const sql = getSql();
    const [codes, summaries, visitors, registrations] = await Promise.all([
      sql`
        SELECT serial, display_name AS "displayName"
        FROM qr_codes
        WHERE id = ${id}
        LIMIT 1
      `,
      sql`
        SELECT
          (SELECT COUNT(*) FROM qr_scans
            WHERE qr_code_id = ${id} AND NOT is_bot AND NOT is_test)::int AS scans,
          (SELECT COUNT(DISTINCT visitor_key) FROM qr_scans
            WHERE qr_code_id = ${id} AND NOT is_bot AND NOT is_test)::int AS "uniqueVisitors",
          (SELECT COUNT(DISTINCT session_key) FROM qr_scans
            WHERE qr_code_id = ${id} AND NOT is_bot AND NOT is_test)::int AS "uniqueSessions",
          (SELECT COUNT(DISTINCT COALESCE(e.metadata->>'sessionId', e.id::text))
            FROM analytics_events e
            JOIN qr_scans event_scan ON event_scan.id::text = e.metadata->>'qrScanId'
            WHERE e.event_type = 'join_opened' AND e.metadata->>'qrCodeId' = ${id}::text
              AND NOT event_scan.is_bot AND NOT event_scan.is_test)::int AS "formOpens",
          (SELECT COUNT(DISTINCT r.id) FROM registrations r
            WHERE r.qr_code_id = ${id} AND NOT r.is_test)::int AS registrations,
          (SELECT COUNT(DISTINCT s.visitor_key)
            FROM qr_scans s
            WHERE s.qr_code_id = ${id} AND NOT s.is_bot AND NOT s.is_test
              AND EXISTS (
                SELECT 1 FROM registrations r
                WHERE r.qr_code_id = ${id} AND NOT r.is_test
                  AND (r.first_qr_scan_id = s.id OR r.last_qr_scan_id = s.id)
              ))::int AS "registeredVisitors"
      `,
      sql`
        WITH valid_scans AS (
          SELECT *
          FROM qr_scans
          WHERE qr_code_id = ${id} AND NOT is_bot AND NOT is_test
        ),
        visitor_stats AS (
          SELECT
            visitor_key,
            COUNT(*)::int AS scans,
            COUNT(DISTINCT session_key)::int AS sessions,
            MIN(scanned_at) AS first_scan,
            MAX(scanned_at) AS last_scan
          FROM valid_scans
          GROUP BY visitor_key
        ),
        latest_scans AS (
          SELECT DISTINCT ON (visitor_key)
            visitor_key, landing_path, language, referrer_host, device_class
          FROM valid_scans
          ORDER BY visitor_key, scanned_at DESC
        ),
        registered_visitors AS (
          SELECT DISTINCT s.visitor_key
          FROM valid_scans s
          JOIN registrations r
            ON r.first_qr_scan_id = s.id OR r.last_qr_scan_id = s.id
          WHERE NOT r.is_test AND r.qr_code_id = ${id}
        )
        SELECT
          'V-' || UPPER(LEFT(stats.visitor_key, 12)) AS "visitorId",
          stats.scans,
          stats.sessions,
          stats.first_scan AS "firstScan",
          stats.last_scan AS "lastScan",
          latest.landing_path AS "landingPath",
          latest.language,
          latest.referrer_host AS "referrerHost",
          latest.device_class AS "deviceClass",
          (registered.visitor_key IS NOT NULL) AS registered
        FROM visitor_stats stats
        JOIN latest_scans latest USING (visitor_key)
        LEFT JOIN registered_visitors registered USING (visitor_key)
        ORDER BY stats.last_scan DESC
        LIMIT 250
      `,
      sql`
        SELECT
          r.id,
          r.role,
          r.name,
          r.pet_type AS "petType",
          r.business_name AS "businessName",
          r.category,
          r.social,
          r.email,
          r.phone,
          r.city,
          r.province,
          r.venue,
          r.created_at AS "createdAt",
          CASE
            WHEN scan.visitor_key IS NULL THEN NULL
            ELSE 'V-' || UPPER(LEFT(scan.visitor_key, 12))
          END AS "visitorId"
        FROM registrations r
        LEFT JOIN qr_scans scan
          ON scan.id = COALESCE(r.last_qr_scan_id, r.first_qr_scan_id)
        WHERE r.qr_code_id = ${id} AND NOT r.is_test
        ORDER BY r.created_at DESC
        LIMIT 250
      `,
    ]);

    const code = codes[0];
    if (!code) {
      return Response.json({ error: "QR not found" }, { status: 404, headers: responseHeaders });
    }

    const summary = summaries[0] || {
      scans: 0,
      uniqueVisitors: 0,
      uniqueSessions: 0,
      formOpens: 0,
      registrations: 0,
      registeredVisitors: 0,
    };

    return Response.json(
      {
        code,
        summary,
        visitors,
        registrations,
        limits: {
          visitors: 250,
          registrations: 250,
          visitorsTruncated: Number(summary.uniqueVisitors || 0) > 250,
          registrationsTruncated: Number(summary.registrations || 0) > 250,
        },
      },
      { headers: responseHeaders },
    );
  } catch (error) {
    logEvent("error", `/api/admin-qrs/${id}/visitors`, "QR visitor detail read failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json(
      { error: "QR visitor details are temporarily unavailable" },
      { status: 503, headers: responseHeaders },
    );
  }
}
