import { ensureSchema, getSql } from "../../../lib/database";
import { logEvent } from "../../../lib/logging";
import { cookies } from "next/headers";
import { decodeScanReference, QR_LAST_COOKIE } from "../../../lib/qr-attribution";
import { MAX_TRACKING_BODY_BYTES, sanitizeTrackingEvent } from "../../../lib/tracking";

export async function POST(request: Request) {
  try {
    const declaredLength = Number(request.headers.get("content-length") || 0);
    if (declaredLength > MAX_TRACKING_BODY_BYTES) return Response.json({ error: "Event too large" }, { status: 413 });
    const raw = await request.text();
    if (raw.length > MAX_TRACKING_BODY_BYTES) return Response.json({ error: "Event too large" }, { status: 413 });
    const event = sanitizeTrackingEvent(JSON.parse(raw));
    if (!event) return Response.json({ error: "Unsupported event" }, { status: 400 });

    await ensureSchema();
    const sql = getSql();
    const jar = await cookies();
    const qrReference = decodeScanReference(jar.get(QR_LAST_COOKIE)?.value);
    let trustedQrMetadata: Record<string, string> = {};
    if (qrReference) {
      try {
        const rows = await sql`
          SELECT qr_code_id AS "qrCodeId", qr_assignment_id AS "qrAssignmentId"
          FROM qr_scans
          WHERE id = ${qrReference.scanId} AND scanned_at >= NOW() - INTERVAL '30 days'
          LIMIT 1
        `;
        if (rows[0]) trustedQrMetadata = {
          qrScanId: qrReference.scanId,
          qrCodeId: rows[0].qrCodeId,
          ...(rows[0].qrAssignmentId ? { qrAssignmentId: rows[0].qrAssignmentId } : {}),
        };
      } catch {
        trustedQrMetadata = {};
      }
    }
    await sql`
      INSERT INTO analytics_events (id, event_type, page, language, audience, metadata)
      VALUES (${crypto.randomUUID()}, ${event.eventType}, ${event.page}, ${event.language}, ${event.audience}, ${JSON.stringify({ ...event.metadata, ...trustedQrMetadata })}::jsonb)
    `;
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    logEvent("error", "/api/track", "Analytics event storage failed", { error: error instanceof Error ? error.message : "Unknown error" });
    return Response.json({ ok: false }, { status: 202 });
  }
}
