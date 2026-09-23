import { ensureSchema, getSql } from "../../../lib/database";
import { logEvent } from "../../../lib/logging";
import { isUuid, safeDestination } from "../../../lib/qr-attribution";
import { hasSameOrigin } from "../../../lib/request-security";
import { isQrShape } from "../../../lib/qr-image";
import { qrPublicUrl } from "../../../lib/qr-image";

const QR_STATUSES = new Set(["unassigned", "active", "paused", "retired"]);
const VENUE_TYPES = new Set([
  "cafe",
  "restaurant",
  "clinic",
  "shelter",
  "event",
  "other",
]);

function destinationInput(value: unknown) {
  const raw = String(value || "").trim();
  const destination = safeDestination(raw);
  return { destination, valid: Boolean(raw) && raw === destination };
}

export async function GET(request: Request) {
  try {
    await ensureSchema();
    const sql = getSql();
    const [codes, summaries, placements] = await Promise.all([
      sql`
        SELECT
          c.id, c.serial, c.public_token AS "publicToken", c.display_name AS "displayName",
          c.status, c.default_destination AS "defaultDestination", c.design_version AS "designVersion",
          c.batch_code AS "batchCode", c.visualization_shape AS "visualizationShape",
          c.created_at AS "createdAt", c.updated_at AS "updatedAt",
          active.id AS "assignmentId", active.placement_id AS "placementId",
          active.label_snapshot AS "venueName", active.location_label_snapshot AS "locationLabel",
          active.assigned_at AS "assignedAt", active.address, active.city, active.province,
          COALESCE(scan_metrics.scans, 0)::int AS scans,
          COALESCE(scan_metrics.unique_visitors, 0)::int AS "uniqueVisitors",
          COALESCE(scan_metrics.unique_sessions, 0)::int AS "uniqueSessions",
          scan_metrics.last_scan AS "lastScan",
          COALESCE(event_metrics.form_opens, 0)::int AS "formOpens",
          COALESCE(registration_metrics.registrations, 0)::int AS registrations
        FROM qr_codes c
        LEFT JOIN LATERAL (
          SELECT a.id, a.placement_id, a.label_snapshot, a.location_label_snapshot, a.assigned_at,
                 p.address, p.city, p.province
          FROM qr_assignments a
          JOIN qr_placements p ON p.id = a.placement_id
          WHERE a.qr_code_id = c.id AND a.ended_at IS NULL
          ORDER BY a.assigned_at DESC
          LIMIT 1
        ) active ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            COUNT(*) FILTER (WHERE NOT s.is_bot AND NOT s.is_test) AS scans,
            COUNT(DISTINCT s.visitor_key) FILTER (WHERE NOT s.is_bot AND NOT s.is_test) AS unique_visitors,
            COUNT(DISTINCT s.session_key) FILTER (WHERE NOT s.is_bot AND NOT s.is_test) AS unique_sessions,
            MAX(s.scanned_at) FILTER (WHERE NOT s.is_bot AND NOT s.is_test) AS last_scan
          FROM qr_scans s
          WHERE s.qr_code_id = c.id
        ) scan_metrics ON TRUE
        LEFT JOIN LATERAL (
          SELECT COUNT(DISTINCT COALESCE(e.metadata->>'sessionId', e.id::text)) AS form_opens
          FROM analytics_events e
          JOIN qr_scans event_scan ON event_scan.id::text = e.metadata->>'qrScanId'
          WHERE e.event_type = 'join_opened' AND e.metadata->>'qrCodeId' = c.id::text
            AND NOT event_scan.is_bot AND NOT event_scan.is_test
        ) event_metrics ON TRUE
        LEFT JOIN LATERAL (
          SELECT COUNT(DISTINCT r.id) FILTER (WHERE NOT r.is_test) AS registrations
          FROM registrations r
          WHERE r.qr_code_id = c.id
        ) registration_metrics ON TRUE
        ORDER BY c.created_at DESC, c.serial ASC
      `,
      sql`
        SELECT
          (SELECT COUNT(*) FROM qr_codes)::int AS "totalCodes",
          (SELECT COUNT(*) FROM qr_codes WHERE status = 'active')::int AS "activeCodes",
          (SELECT COUNT(*) FROM qr_codes WHERE status = 'unassigned')::int AS "unassignedCodes",
          (SELECT COUNT(*) FROM qr_scans WHERE NOT is_bot AND NOT is_test)::int AS scans,
          (SELECT COUNT(DISTINCT visitor_key) FROM qr_scans WHERE NOT is_bot AND NOT is_test)::int AS "uniqueVisitors",
          (SELECT COUNT(DISTINCT COALESCE(e.metadata->>'sessionId', e.id::text))
            FROM analytics_events e
            JOIN qr_scans event_scan ON event_scan.id::text = e.metadata->>'qrScanId'
            WHERE e.event_type = 'join_opened' AND e.metadata->>'qrCodeId' IS NOT NULL
              AND NOT event_scan.is_bot AND NOT event_scan.is_test)::int AS "formOpens",
          (SELECT COUNT(DISTINCT id) FROM registrations WHERE qr_code_id IS NOT NULL AND NOT is_test)::int AS registrations
      `,
      sql`
        SELECT
          p.id, p.name, p.venue_type AS "venueType", p.address, p.city, p.province, p.notes,
          COUNT(a.id) FILTER (WHERE a.ended_at IS NULL)::int AS "activeQrCount"
        FROM qr_placements p
        LEFT JOIN qr_assignments a ON a.placement_id = p.id
        WHERE p.is_active
        GROUP BY p.id
        ORDER BY p.name
      `,
    ]);
    return Response.json(
      {
        codes: codes.map((code) => ({
          ...code,
          publicUrl: qrPublicUrl(request.url, code.publicToken),
        })),
        placements,
        summary: summaries[0] || {},
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    logEvent("error", "/api/admin-qrs", "QR inventory read failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json(
      {
        error: "QR database is unavailable or migrations have not been applied",
      },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request))
    return Response.json({ error: "Invalid request origin" }, { status: 403 });
  try {
    const body = await request.json();
    const action = String(body.action || "");
    await ensureSchema();
    const sql = getSql();

    if (action === "create") {
      const displayName = String(body.displayName || "")
        .trim()
        .slice(0, 160);
      const shape = body.visualizationShape;
      const { destination, valid: destinationValid } = destinationInput(
        body.defaultDestination,
      );
      if (!displayName)
        return Response.json({ error: "QR name is required" }, { status: 400 });
      if (!isQrShape(shape))
        return Response.json(
          { error: "Choose rectangle, circle or paw" },
          { status: 400 },
        );
      if (!destinationValid)
        return Response.json(
          { error: "Choose a valid public BuddyLife destination path" },
          { status: 400 },
        );
      const id = crypto.randomUUID();
      const token = crypto.randomUUID().replaceAll("-", "");
      const serial = `PREVIEW-${token.slice(0, 8).toUpperCase()}`;
      const inserted = await sql`
        INSERT INTO qr_codes (
          id, serial, public_token, display_name, status, default_destination,
          design_version, batch_code, visualization_shape, token, is_test, is_permanent
        ) VALUES (
          ${id}, ${serial}, ${token}, ${displayName}, 'unassigned', ${destination},
          'preview-individual-v1', 'PREVIEW-ONLY', ${shape}, ${token}, TRUE, FALSE
        )
        RETURNING id, serial, public_token AS "publicToken", visualization_shape AS "visualizationShape"
      `;
      await sql`
        INSERT INTO qr_audit_log (qr_code_id, action, details)
        VALUES (${id}, 'qr_created', ${JSON.stringify({ displayName, shape, previewOnly: true })}::jsonb)
      `;
      return Response.json({ ok: true, code: inserted[0] }, { status: 201 });
    }

    const qrId = String(body.qrId || "");
    if (!isUuid(qrId))
      return Response.json({ error: "Invalid QR identity" }, { status: 400 });

    if (action === "update") {
      const displayName = String(body.displayName || "")
        .trim()
        .slice(0, 160);
      const status = String(body.status || "");
      const shape = body.visualizationShape;
      const { destination, valid: destinationValid } = destinationInput(
        body.defaultDestination,
      );
      if (!displayName || !QR_STATUSES.has(status) || !isQrShape(shape))
        return Response.json(
          { error: "Name, status and printable design are required" },
          { status: 400 },
        );
      if (!destinationValid)
        return Response.json(
          { error: "Choose a valid public BuddyLife destination path" },
          { status: 400 },
        );
      const assignments = await sql`
        SELECT id FROM qr_assignments WHERE qr_code_id = ${qrId} AND ended_at IS NULL LIMIT 1
      `;
      if (assignments.length && status === "unassigned")
        return Response.json(
          { error: "Use Unassign before setting an assigned QR to unassigned" },
          { status: 400 },
        );
      if (!assignments.length && status === "active")
        return Response.json(
          { error: "Assign a venue before activating this QR" },
          { status: 400 },
        );
      const updated = await sql`
        UPDATE qr_codes
        SET display_name = ${displayName}, status = ${status}, visualization_shape = ${shape},
            default_destination = ${destination}, updated_at = NOW()
        WHERE id = ${qrId}
        RETURNING id
      `;
      if (!updated.length)
        return Response.json({ error: "QR not found" }, { status: 404 });
      await sql`
        INSERT INTO qr_audit_log (qr_code_id, action, details)
        VALUES (${qrId}, 'qr_updated', ${JSON.stringify({ displayName, status, shape, destination })}::jsonb)
      `;
      return Response.json({ ok: true });
    }

    if (action === "assign") {
      let venueName = String(body.venueName || "")
        .trim()
        .slice(0, 160);
      const locationLabel =
        String(body.locationLabel || "")
          .trim()
          .slice(0, 160) || null;
      const venueType = VENUE_TYPES.has(String(body.venueType || ""))
        ? String(body.venueType)
        : "other";
      const address =
        String(body.address || "")
          .trim()
          .slice(0, 240) || null;
      const city =
        String(body.city || "")
          .trim()
          .slice(0, 120) || null;
      const province =
        String(body.province || "")
          .trim()
          .slice(0, 120) || null;
      const notes =
        String(body.notes || "")
          .trim()
          .slice(0, 1000) || null;
      const { destination, valid: destinationValid } = destinationInput(
        body.destinationPath,
      );
      if (!destinationValid)
        return Response.json(
          { error: "Choose a valid public BuddyLife destination path" },
          { status: 400 },
        );
      const requestedPlacementId = String(body.placementId || "");
      let placementId = crypto.randomUUID();
      let createPlacement = true;
      if (isUuid(requestedPlacementId)) {
        const existingPlacements = await sql`
          SELECT id, name FROM qr_placements WHERE id = ${requestedPlacementId} AND is_active LIMIT 1
        `;
        if (!existingPlacements.length)
          return Response.json(
            { error: "Selected venue was not found" },
            { status: 404 },
          );
        placementId = existingPlacements[0].id;
        venueName = existingPlacements[0].name;
        createPlacement = false;
      }
      if (!venueName)
        return Response.json(
          { error: "Choose an existing venue or enter a new venue name" },
          { status: 400 },
        );

      const assignmentId = crypto.randomUUID();
      const transactionQueries = [
        sql`UPDATE qr_assignments SET ended_at = NOW() WHERE qr_code_id = ${qrId} AND ended_at IS NULL`,
      ];
      if (createPlacement)
        transactionQueries.push(
          sql`
          INSERT INTO qr_placements (id, name, venue_type, address, city, province, notes)
          VALUES (${placementId}, ${venueName}, ${venueType}, ${address}, ${city}, ${province}, ${notes})
        `,
        );
      transactionQueries.push(
        sql`
          INSERT INTO qr_assignments (
            id, qr_code_id, placement_id, label_snapshot, location_label_snapshot, destination_path
          ) VALUES (${assignmentId}, ${qrId}, ${placementId}, ${venueName}, ${locationLabel}, ${destination})
        `,
        sql`UPDATE qr_codes SET status = 'active', updated_at = NOW() WHERE id = ${qrId}`,
        sql`
          INSERT INTO qr_audit_log (qr_code_id, action, details)
          VALUES (${qrId}, 'assignment_created', ${JSON.stringify({ placementId, assignmentId, venueName, locationLabel, reusedPlacement: !createPlacement })}::jsonb)
        `,
      );
      await sql.transaction(transactionQueries);
      return Response.json(
        { ok: true, placementId, assignmentId },
        { status: 201 },
      );
    }

    if (action === "unassign") {
      await sql.transaction([
        sql`UPDATE qr_assignments SET ended_at = NOW() WHERE qr_code_id = ${qrId} AND ended_at IS NULL`,
        sql`UPDATE qr_codes SET status = 'unassigned', updated_at = NOW() WHERE id = ${qrId}`,
        sql`INSERT INTO qr_audit_log (qr_code_id, action) VALUES (${qrId}, 'assignment_ended')`,
      ]);
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Unsupported QR action" }, { status: 400 });
  } catch (error) {
    logEvent("error", "/api/admin-qrs", "QR inventory update failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json({ error: "QR update failed" }, { status: 503 });
  }
}
