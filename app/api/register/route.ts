import { ensureSchema, getSql } from "../../../lib/database";
import { logEvent } from "../../../lib/logging";

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
    await sql`
      INSERT INTO registrations (id, role, name, pet_type, business_name, category, social, email, phone, city, province, source, medium, campaign, venue)
      VALUES (
        ${id}, ${role}, ${String(body.name || "").trim() || null}, ${String(body.petType || "").trim() || null},
        ${String(body.businessName || "").trim() || null}, ${String(body.category || "").trim() || null},
        ${String(body.social || "").trim() || null}, ${email}, ${phone},
        ${String(body.city || "").trim() || null}, ${String(body.province || "").trim() || null},
        ${String(body.utmSource || "").trim().slice(0, 120) || null}, ${String(body.utmMedium || "").trim().slice(0, 120) || null},
        ${String(body.utmCampaign || "").trim().slice(0, 160) || null}, ${String(body.venue || "").trim().slice(0, 160) || null}
      )
    `;
    logEvent("info", "/api/register", "Registration stored", { role, hasAttribution: Boolean(body.utmSource || body.utmCampaign) });
    return Response.json({ ok: true, id }, { status: 201 });
  } catch (error) {
    logEvent("error", "/api/register", "Registration storage failed", { error: error instanceof Error ? error.message : "Unknown error" });
    return Response.json({ error: "Registration service is temporarily unavailable" }, { status: 503 });
  }
}
