import { ensureSchema, getSql } from "../../../lib/database";

const legacyUrl = "https://buddylife-armenia.khachvantsyan.chatgpt.site/api/admin-content";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST() {
  const authorization = process.env.SITES_BYPASS_TOKEN;
  if (!authorization) {
    return Response.json({ error: "Legacy access token is unavailable." }, { status: 503 });
  }

  try {
    const legacy = await fetch(legacyUrl, {
      headers: {
        "OAI-Sites-Authorization": `Bearer ${authorization}`,
        "oai-authenticated-user-id": "buddylife-backoffice",
        "oai-authenticated-user-email": "khachvantsyan@gmail.com",
      },
      cache: "no-store",
    });

    if (!legacy.ok) {
      return Response.json(
        { error: "Legacy storage rejected the recovery request.", legacyStatus: legacy.status },
        { status: 502 },
      );
    }

    const payload = await legacy.json();
    const registrations = Array.isArray(payload?.registrations) ? payload.registrations : [];
    await ensureSchema();
    const sql = getSql();
    let imported = 0;
    let duplicates = 0;
    let skipped = 0;

    for (const item of registrations) {
      const role = item?.role === "business" ? "business" : item?.role === "parent" ? "parent" : "";
      const email = text(item?.email).toLowerCase();
      const phone = text(item?.phone);
      if (!role || !email || !phone) {
        skipped += 1;
        continue;
      }

      const existing = await sql`
        SELECT id FROM registrations
        WHERE LOWER(email) = ${email} OR phone = ${phone}
        LIMIT 1
      `;
      if (existing.length) {
        duplicates += 1;
        continue;
      }

      const legacyId = text(item?.id);
      const id = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(legacyId)
        ? legacyId
        : crypto.randomUUID();
      const createdAt = Number.isNaN(Date.parse(text(item?.createdAt))) ? new Date().toISOString() : text(item.createdAt);

      await sql`
        INSERT INTO registrations
          (id, role, name, pet_type, business_name, category, social, email, phone, city, province, created_at)
        VALUES
          (${id}, ${role}, ${text(item?.name)}, ${text(item?.petType)}, ${text(item?.businessName)},
           ${text(item?.category)}, ${text(item?.social)}, ${email}, ${phone}, ${text(item?.city)},
           ${text(item?.province)}, ${createdAt})
        ON CONFLICT (id) DO NOTHING
      `;
      imported += 1;
    }

    return Response.json({ ok: true, found: registrations.length, imported, duplicates, skipped });
  } catch (error) {
    console.error("Legacy registration migration failed", error);
    return Response.json({ error: "Legacy recovery failed." }, { status: 502 });
  }
}
