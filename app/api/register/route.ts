import { ensureSchema, getSql } from "../../../lib/database";
import { logEvent } from "../../../lib/logging";
import { cookies } from "next/headers";
import { decodeScanReference, QR_FIRST_COOKIE, QR_LAST_COOKIE } from "../../../lib/qr-attribution";

type QrAttribution = {
  firstScanId: string | null;
  lastScanId: string;
  qrCodeId: string;
  assignmentId: string | null;
  serial: string;
  displayName: string;
  venueName: string | null;
};

async function getQrAttribution(): Promise<QrAttribution | null> {
  const jar = await cookies();
  const firstReference = decodeScanReference(jar.get(QR_FIRST_COOKIE)?.value);
  const lastReference = decodeScanReference(jar.get(QR_LAST_COOKIE)?.value);
  if (!lastReference) return null;

  try {
    const sql = getSql();
    const [lastRows, firstRows] = await Promise.all([
      sql`
        SELECT
          s.id AS "lastScanId", s.qr_code_id AS "qrCodeId", s.qr_assignment_id AS "assignmentId",
          c.serial, c.display_name AS "displayName", a.label_snapshot AS "venueName"
        FROM qr_scans s
        JOIN qr_codes c ON c.id = s.qr_code_id
        LEFT JOIN qr_assignments a ON a.id = s.qr_assignment_id
        WHERE s.id = ${lastReference.scanId}
          AND s.scanned_at >= NOW() - INTERVAL '30 days'
          AND NOT s.is_bot AND NOT s.is_test
        LIMIT 1
      `,
      firstReference
        ? sql`
            SELECT id FROM qr_scans
            WHERE id = ${firstReference.scanId}
              AND scanned_at >= NOW() - INTERVAL '30 days'
              AND NOT is_bot AND NOT is_test
            LIMIT 1
          `
        : Promise.resolve([]),
    ]);
    const last = lastRows[0];
    if (!last) return null;
    return {
      firstScanId: firstRows[0]?.id || last.lastScanId,
      lastScanId: last.lastScanId,
      qrCodeId: last.qrCodeId,
      assignmentId: last.assignmentId || null,
      serial: last.serial,
      displayName: last.displayName,
      venueName: last.venueName || null,
    };
  } catch (error) {
    logEvent("info", "/api/register", "QR attribution lookup skipped", { error: error instanceof Error ? error.message : "Unknown error" });
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const role = body.role === "business" ? "business" : body.role === "parent" ? "parent" : "";
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").replace(/\D/g, "");
    if (!role || !email || !phone) return Response.json({ error: "Required fields are missing" }, { status: 400 });
    if (role === "parent" && (!String(body.name || "").trim() || !String(body.petType || "").trim())) return Response.json({ error: "Parent details are missing" }, { status: 400 });
    if (role === "business" && (!String(body.businessName || "").trim() || !String(body.category || "").trim())) return Response.json({ error: "Business details are missing" }, { status: 400 });

    await ensureSchema();
    const sql = getSql();
    const qrAttribution = await getQrAttribution();
    const existing = await sql`
      SELECT id FROM registrations
      WHERE role = ${role} AND (LOWER(email) = ${email} OR phone = ${phone})
      ORDER BY created_at DESC LIMIT 1
    `;
    if (existing.length) {
      logEvent("info", "/api/register", "Duplicate registration prevented", { role });
      return Response.json({ ok: true, id: existing[0].id, duplicate: true });
    }
    const id = crypto.randomUUID();
    const source = qrAttribution ? "venue_qr" : String(body.utmSource || "").trim().slice(0, 120) || null;
    const medium = qrAttribution ? "offline" : String(body.utmMedium || "").trim().slice(0, 120) || null;
    const campaign = qrAttribution ? "pet_friendly_places" : String(body.utmCampaign || "").trim().slice(0, 160) || null;
    const venue = qrAttribution
      ? qrAttribution.venueName || qrAttribution.displayName || qrAttribution.serial
      : String(body.venue || "").trim().slice(0, 160) || null;
    if (qrAttribution) {
      await sql`
        INSERT INTO registrations (
          id, role, name, pet_type, business_name, category, social, email, phone, city, province,
          source, medium, campaign, venue, first_qr_scan_id, last_qr_scan_id, qr_code_id,
          qr_assignment_id, attribution_captured_at
        )
        VALUES (
          ${id}, ${role}, ${String(body.name || "").trim() || null}, ${String(body.petType || "").trim() || null},
          ${String(body.businessName || "").trim() || null}, ${String(body.category || "").trim() || null},
          ${String(body.social || "").trim() || null}, ${email}, ${phone},
          ${String(body.city || "").trim() || null}, ${String(body.province || "").trim() || null},
          ${source}, ${medium}, ${campaign}, ${venue}, ${qrAttribution.firstScanId},
          ${qrAttribution.lastScanId}, ${qrAttribution.qrCodeId},
          ${qrAttribution.assignmentId}, ${new Date().toISOString()}
        )
      `;
    } else {
      await sql`
        INSERT INTO registrations (
          id, role, name, pet_type, business_name, category, social, email, phone, city, province,
          source, medium, campaign, venue
        )
        VALUES (
          ${id}, ${role}, ${String(body.name || "").trim() || null}, ${String(body.petType || "").trim() || null},
          ${String(body.businessName || "").trim() || null}, ${String(body.category || "").trim() || null},
          ${String(body.social || "").trim() || null}, ${email}, ${phone},
          ${String(body.city || "").trim() || null}, ${String(body.province || "").trim() || null},
          ${source}, ${medium}, ${campaign}, ${venue}
        )
      `;
    }
    logEvent("info", "/api/register", "Registration stored", { role, hasAttribution: Boolean(qrAttribution || body.utmSource || body.utmCampaign), qrSerial: qrAttribution?.serial || null });
    return Response.json({ ok: true, id }, { status: 201 });
  } catch (error) {
    logEvent("error", "/api/register", "Registration storage failed", { error: error instanceof Error ? error.message : "Unknown error" });
    return Response.json({ error: "Registration service is temporarily unavailable" }, { status: 503 });
  }
}
