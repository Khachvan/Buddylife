import { getDb } from "../../../db";
import { registrations } from "../../../db/schema";
export async function POST(request: Request) {
  try {
    const p = (await request.json()) as Record<string, unknown>;
    const role = p.role === "business" ? "business" : "parent";
    const email = String(p.email || "").trim();
    const phone = String(p.phone || "").trim();
    const name = String(p.name || "").trim();
    const businessName = String(p.businessName || "").trim();
    const petType = String(p.petType || "").trim();
    const category = String(p.category || "").trim();
    if (!email && !phone)
      return Response.json(
        { error: "Email or phone is required" },
        { status: 400 },
      );
    if (role === "parent" && (!name || !petType))
      return Response.json(
        { error: "Name and pet type are required" },
        { status: 400 },
      );
    if (role === "business" && (!businessName || !category))
      return Response.json(
        { error: "Business name and category are required" },
        { status: 400 },
      );
    const [row] = await getDb()
      .insert(registrations)
      .values({
        role,
        email: email || null,
        phone: phone || null,
        name,
        businessName,
        petType,
        petName: String(p.petName || ""),
        category,
        city: String(p.city || ""),
        province: String(p.province || ""),
        social: String(p.social || ""),
        interests: JSON.stringify(p.interests || []),
      })
      .returning({ id: registrations.id });
    return Response.json({ ok: true, id: row.id }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Registration could not be saved" },
      { status: 500 },
    );
  }
}
