import { ensureSchema, getSql } from "../../../lib/database";
import { logEvent } from "../../../lib/logging";
import { hasSameOrigin } from "../../../lib/request-security";

export async function GET() {
  try {
    await ensureSchema();
    const sql = getSql();
    const registrationRowsPromise = (async () => {
      try {
        return await sql`
          SELECT r.id, r.role, r.name, r.pet_type AS "petType", r.business_name AS "businessName", r.category, r.social,
                 r.email, r.phone, r.city, r.province, r.source, r.medium, r.campaign, r.venue,
                 r.is_test AS "isTest", r.created_at AS "createdAt", q.serial AS "qrSerial",
                 q.display_name AS "qrName", a.label_snapshot AS "qrVenue"
          FROM registrations r
          LEFT JOIN qr_codes q ON q.id = r.qr_code_id
          LEFT JOIN qr_assignments a ON a.id = r.qr_assignment_id
          ORDER BY r.created_at DESC
        `;
      } catch {
        return sql`
          SELECT id, role, name, pet_type AS "petType", business_name AS "businessName", category, social,
                 email, phone, city, province, source, medium, campaign, venue,
                 is_test AS "isTest", created_at AS "createdAt"
          FROM registrations ORDER BY created_at DESC
        `;
      }
    })();
    const [contentRows, registrationRows, eventRows] = await Promise.all([
      sql`SELECT key, value FROM cms_content ORDER BY key`,
      registrationRowsPromise,
      sql`
        SELECT id, event_type AS "eventType", page, language, audience, metadata, created_at AS "createdAt"
        FROM analytics_events ORDER BY created_at DESC LIMIT 5000
      `,
    ]);
    return Response.json({
      content: Object.fromEntries(contentRows.map((row) => [row.key, row.value])),
      registrations: registrationRows,
      events: eventRows,
    });
  } catch (error) {
    logEvent("error", "/api/admin-content", "Backoffice data read failed", { error: error instanceof Error ? error.message : "Unknown error" });
    return Response.json({ error: "Database connection failed" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  try {
    const { key, value } = await request.json();
    const safeKey = String(key || "").trim();
    if (!safeKey) return Response.json({ error: "Missing content key" }, { status: 400 });
    await ensureSchema();
    await getSql()`
      INSERT INTO cms_content (key, value, updated_at) VALUES (${safeKey}, ${String(value || "")}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;
    return Response.json({ ok: true });
  } catch (error) {
    logEvent("error", "/api/admin-content", "Backoffice content save failed", { error: error instanceof Error ? error.message : "Unknown error" });
    return Response.json({ error: "Database connection failed" }, { status: 503 });
  }
}
