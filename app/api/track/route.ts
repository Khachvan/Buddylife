import { ensureSchema, getSql } from "../../../lib/database";
import { logEvent } from "../../../lib/logging";
import { cookies } from "next/headers";
import { decodeScanReference, QR_LAST_COOKIE } from "../../../lib/qr-attribution";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventType = String(body.eventType || "").trim();
    if (!eventType) return Response.json({ error: "Missing event type" }, { status: 400 });
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
    const safeMetadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};
    await sql`
      INSERT INTO analytics_events (id, event_type, page, language, audience, metadata)
      VALUES (${crypto.randomUUID()}, ${eventType}, ${String(body.page || "") || null}, ${String(body.language || "") || null}, ${String(body.audience || "") || null}, ${JSON.stringify({ ...safeMetadata, ...trustedQrMetadata })}::jsonb)
    `;
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    logEvent("error", "/api/track", "Analytics event storage failed", { error: error instanceof Error ? error.message : "Unknown error" });
    return Response.json({ ok: false }, { status: 202 });
  }
}
