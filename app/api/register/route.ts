import { ensureSchema, getSql } from "../../../lib/database";

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
    const id = crypto.randomUUID();
    await sql`
      INSERT INTO registrations (id, role, name, pet_type, business_name, category, social, email, phone, city, province)
      VALUES (
        ${id}, ${role}, ${String(body.name || "").trim() || null}, ${String(body.petType || "").trim() || null},
        ${String(body.businessName || "").trim() || null}, ${String(body.category || "").trim() || null},
        ${String(body.social || "").trim() || null}, ${email}, ${phone},
        ${String(body.city || "").trim() || null}, ${String(body.province || "").trim() || null}
      )
    `;
    return Response.json({ ok: true, id }, { status: 201 });
  } catch (error) {
    console.error("Registration storage failed", error);
    return Response.json({ error: "Registration service is temporarily unavailable" }, { status: 503 });
  }
}
